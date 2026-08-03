import React, { useEffect, useRef, useState } from 'react';
import { quotesData } from '../../data/quotes';

// Helper to wrap text for the canvas
const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

// Helper to draw a glowing word particle
const drawWord = (ctx, text, x, y, alpha, colors, fontSize, colorType) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  
  ctx.font = `500 ${fontSize}px "Fira Code", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const rgb = colorType === 'primary' ? colors.primaryRgb : colors.secondaryRgb;
  ctx.shadowColor = `rgba(${rgb}, 0.55)`;
  ctx.shadowBlur = 4;
  ctx.fillStyle = `rgba(${rgb}, 0.95)`;
  
  ctx.fillText(text, x, y);
  ctx.restore();
};

// Quote text only — soft glow, no rectangular capsule/border
const drawQuoteCapsule = (ctx, lines, author, x, y, colors, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const quoteLineHeight = 15;
  const authorLineHeight = 14;
  const blockHeight = lines.length * quoteLineHeight + authorLineHeight;
  let lineY = y - blockHeight / 2 + quoteLineHeight / 2;

  ctx.font = 'bold 11px "Space Grotesk", sans-serif';
  ctx.shadowColor = `rgba(${colors.primaryRgb}, 0.55)`;
  ctx.shadowBlur = 10;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';

  lines.forEach((line) => {
    ctx.fillText(line, x, lineY);
    lineY += quoteLineHeight;
  });

  ctx.shadowColor = `rgba(${colors.secondaryRgb}, 0.5)`;
  ctx.shadowBlur = 8;
  ctx.fillStyle = `rgba(${colors.secondaryRgb}, 0.95)`;
  ctx.font = '9px "Fira Code", monospace';
  ctx.fillText(`— ${author}`, x, lineY + 2);

  ctx.restore();
};

const InteractiveAvatar = ({ theme = 'cyber', profile, loading, language = 'en' }) => {
  const containerRef = useRef(null);
  const emitterCanvasRef = useRef(null);
  const triggerQuoteRef = useRef(null);
  const lastQuoteIndexRef = useRef(-1);
  const [progress, setProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const themeColors = React.useMemo(() => {
    switch (theme) {
      case 'solar':
        return {
          primaryHex: 0xf2994a,
          secondaryHex: 0xeb5757,
          primaryStr: '#f2994a',
          secondaryStr: '#eb5757',
          primaryRgb: '242, 153, 74',
          secondaryRgb: '235, 87, 87'
        };
      case 'emerald':
        return {
          primaryHex: 0x22c55e,
          secondaryHex: 0x0f766e,
          primaryStr: '#22c55e',
          secondaryStr: '#0f766e',
          primaryRgb: '34, 197, 94',
          secondaryRgb: '15, 118, 110'
        };
      case 'void':
        return {
          primaryHex: 0xd1d5db,
          secondaryHex: 0x6b7280,
          primaryStr: '#d1d5db',
          secondaryStr: '#6b7280',
          primaryRgb: '209, 213, 219',
          secondaryRgb: '107, 114, 128'
        };
      case 'cyber':
      default:
        return {
          primaryHex: 0x22d3ee,
          secondaryHex: 0xa855f7,
          primaryStr: '#22d3ee',
          secondaryStr: '#a855f7',
          primaryRgb: '34, 211, 238',
          secondaryRgb: '168, 85, 247'
        };
    }
  }, [theme]);

  useEffect(() => {
    if (loading || loadError) return;

    let isMounted = true;
    let isVisible = false;
    let intersectionObserver;
    let renderer, scene, camera, clock, animate;
    let modelContainer, avatarGroup;
    let keyLight, fillLight, rimLight, pointLight, accentPoint, crownLight;
    let hudRing, dotRing, scanRing;
    let animationFrameId;
    let rimBaseIntensity = 3.6;
    let pointBaseIntensity = 7.5;

    // Mouse interpolation state
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let isHovered = false;

    const initThree = (THREE, GLTFLoader) => {
      if (!containerRef.current) return;

      // Slightly higher internal res → cleaner glass speculars inside 256 CSS box
      const width = 320;
      const height = 320;

      scene = new THREE.Scene();

      // Slightly longer lens, camera a touch high for a heroic head angle
      camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      // Pull camera back so a larger CSS circle doesn't enlarge the head
      // (circle w-72 vs former w-64 → 72/64 zoom compensation)
      camera.position.set(0, 0.12, 4.33);
      camera.lookAt(0, -0.05, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      // Slightly lower exposure keeps body black; hard speculars still punch
      renderer.toneMappingExposure = 1.0;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);
      // Fit CSS box (w-64) while keeping higher internal resolution
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';

      avatarGroup = new THREE.Group();
      scene.add(avatarGroup);

      // --- Lighting: obsidian body + black-diamond facet sparkles ---
      scene.add(new THREE.AmbientLight(0x06080e, 0.05));
      scene.add(new THREE.HemisphereLight(0x141824, 0x000000, 0.14));

      // Soft key — form only, keeps body dark
      keyLight = new THREE.DirectionalLight(0xf2f5fa, 1.7);
      keyLight.position.set(2.0, 4.6, 3.4);
      scene.add(keyLight);

      fillLight = new THREE.DirectionalLight(0xa8b4c8, 0.28);
      fillLight.position.set(-3.0, 1.0, 2.6);
      scene.add(fillLight);

      // Thin site-color rims (edge fire, not body tint)
      rimBaseIntensity = 1.15;
      rimLight = new THREE.DirectionalLight(themeColors.secondaryHex, rimBaseIntensity);
      rimLight.position.set(-3.2, 2.6, -4.0);
      scene.add(rimLight);

      const rimPrimary = new THREE.DirectionalLight(themeColors.primaryHex, 1.05);
      rimPrimary.position.set(3.8, 1.2, -2.6);
      scene.add(rimPrimary);

      // Hard crown kick — diamond facet streak
      crownLight = new THREE.DirectionalLight(0xffffff, 6.0);
      crownLight.position.set(0.25, 7.2, -0.4);
      scene.add(crownLight);

      // Moving specular “sparkle” across facets
      pointBaseIntensity = 8.5;
      pointLight = new THREE.PointLight(0xffffff, pointBaseIntensity, 7.5, 2.2);
      pointLight.position.set(0.5, 1.6, 2.2);
      scene.add(pointLight);

      // Tiny colored edge fire (primary / secondary)
      accentPoint = new THREE.PointLight(themeColors.primaryHex, 0.7, 8, 2.2);
      accentPoint.position.set(1.35, 0.7, 1.6);
      scene.add(accentPoint);

      const secondaryGlint = new THREE.PointLight(themeColors.secondaryHex, 0.65, 8, 2.2);
      secondaryGlint.position.set(-1.35, 0.55, 1.5);
      scene.add(secondaryGlint);

      // Tight white diamond glints (short range = hard sparkles)
      const glint = new THREE.PointLight(0xffffff, 14.0, 2.8, 2.8);
      glint.position.set(0.15, 1.85, 1.05);
      scene.add(glint);

      const glint2 = new THREE.PointLight(0xffffff, 9.0, 2.4, 2.6);
      glint2.position.set(-0.55, 1.35, 1.4);
      scene.add(glint2);

      // Jewelry-studio env: thin white strips + tiny site-color panels
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x000000);
      const addEnvPanel = (color, x, y, z, w, h) => {
        const panel = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
        );
        panel.position.set(x, y, z);
        panel.lookAt(0, 0, 0);
        envScene.add(panel);
      };
      // Sharp white “studio bars” → diamond facet reflections
      addEnvPanel(0xffffff, 0, 7.5, 1, 12, 0.7);
      addEnvPanel(0xffffff, 3.8, 5.5, -1.2, 0.7, 7);
      addEnvPanel(0xffffff, -2.8, 4.8, 2, 0.55, 5);
      addEnvPanel(0xf8fafc, 1.5, 6.2, -3, 4, 0.5);
      addEnvPanel(0xffffff, -4.5, 2, -2, 0.5, 3);
      // Small site-color fire in the reflections only
      addEnvPanel(themeColors.primaryHex, 5.6, 1.5, 2.0, 1.6, 2.4);
      addEnvPanel(themeColors.secondaryHex, -5.6, 1.8, 1.0, 1.6, 2.4);
      addEnvPanel(0x000000, 0, -5, 0, 18, 10);
      addEnvPanel(0x000000, 0, 0, 8, 14, 10);
      const envMap = pmrem.fromScene(envScene, 0.018).texture;
      scene.environment = envMap;
      if ('environmentIntensity' in scene) {
        scene.environmentIntensity = 1.65;
      }
      pmrem.dispose();
      envScene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });

      // --- HUD rings (same style as live site): flat RingGeometry, gyro spin ---
      const ringY = -0.22;

      const ringGeom = new THREE.RingGeometry(1.42, 1.44, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: themeColors.primaryHex,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      hudRing = new THREE.Mesh(ringGeom, ringMat);
      hudRing.position.set(0, ringY, 0);
      avatarGroup.add(hudRing);

      // Technical dotted / wireframe ring
      const dotRingGeom = new THREE.RingGeometry(1.5, 1.51, 32);
      const dotRingMat = new THREE.MeshBasicMaterial({
        color: themeColors.secondaryHex,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      dotRing = new THREE.Mesh(dotRingGeom, dotRingMat);
      dotRing.position.set(0, ringY, 0);
      avatarGroup.add(dotRing);

      // Thin outermost scan ring
      const scanRingGeom = new THREE.RingGeometry(1.58, 1.59, 64);
      const scanRingMat = new THREE.MeshBasicMaterial({
        color: themeColors.primaryHex,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      scanRing = new THREE.Mesh(scanRingGeom, scanRingMat);
      scanRing.position.set(0, ringY, 0);
      avatarGroup.add(scanRing);

      // 6. Load GLTF model
      const loader = new GLTFLoader();
      
      loader.load(
        '/stylized-head.glb',
        (gltf) => {
          if (!isMounted) {
            // Clean up the loaded resources to prevent memory leaks if we unmounted during load
            gltf.scene.traverse((child) => {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat) => {
                  if (mat.map) mat.map.dispose();
                  mat.dispose();
                });
              }
            });
            return;
          }

          const model = gltf.scene;

          // Compute boundaries for centering and scaling
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          modelContainer = new THREE.Group();
          // Center the model relative to the modelContainer
          model.position.set(-center.x, -center.y, -center.z);
          modelContainer.add(model);

          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            // Fill the circle; neck clips under the frame
            const targetSize = 2.85;
            const scale = targetSize / maxDim;
            modelContainer.scale.set(scale, scale, scale);
          }
          modelContainer.position.y = -0.22;

          const meshes = [];
          model.traverse((node) => {
            if (node.isMesh) meshes.push(node);
          });

          meshes.forEach((mesh) => {
            mesh.visible = true;
            mesh.castShadow = false;
            mesh.receiveShadow = false;

            if (mesh.geometry) {
              mesh.geometry.computeVertexNormals();
            }

            // Between black diamond & obsidian:
            // deep black body (obsidian) + hard facet speculars / high IOR (diamond)
            const cyberGlassMat = new THREE.MeshPhysicalMaterial({
              color: 0x020306,
              metalness: 0.42,
              roughness: 0.07,
              transparent: true,
              opacity: 0.78,
              depthWrite: true,
              side: THREE.FrontSide,
              // Hard outer polish — diamond clearcoat
              clearcoat: 1.0,
              clearcoatRoughness: 0.015,
              // Gem-like refraction (glass 1.5 → diamond ~2.4; sweet spot ~2.0)
              ior: 2.05,
              reflectivity: 1.0,
              envMapIntensity: 2.05,
              // Slight internal depth without washing color through the volume
              transmission: 0.32,
              thickness: 1.15,
              attenuationColor: new THREE.Color(0x010104),
              attenuationDistance: 0.28,
              emissive: new THREE.Color(0x000000),
              emissiveIntensity: 0,
              // Obsidian oil-slick at grazing angles only
              sheen: 0.05,
              sheenRoughness: 0.7,
              sheenColor: new THREE.Color(0xffffff),
              iridescence: 0.16,
              iridescenceIOR: 1.6,
              iridescenceThicknessRange: [140, 320],
              specularIntensity: 1.0,
              specularColor: new THREE.Color(0xffffff),
              premultipliedAlpha: false,
            });

            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat) => mat.dispose());
              } else {
                mesh.material.dispose();
              }
            }
            mesh.material = cyberGlassMat;
          });

          avatarGroup.add(modelContainer);
          setModelLoaded(true);
          setProgress(100);
        },
        (xhr) => {
          if (xhr.total && isMounted) {
            const percent = Math.min(99, Math.round((xhr.loaded / xhr.total) * 100));
            setProgress(percent);
          }
        },
        (error) => {
          console.error("Error loading 3D avatar GLB model:", error);
          if (isMounted) {
            setLoadError(true);
          }
        }
      );

      // 7. Animation — smoother cadence, breathing rim, living specular
      clock = new THREE.Clock();
      let lastRenderTime = 0;
      const frameInterval = 1000 / 40;

      animate = (timestamp = 0) => {
        if (!isMounted) return;
        if (!isVisible) return;

        animationFrameId = requestAnimationFrame(animate);

        if (timestamp) {
          const elapsed = timestamp - lastRenderTime;
          if (elapsed < frameInterval) return;
          lastRenderTime = timestamp - (elapsed % frameInterval);
        }

        const time = clock.getElapsedTime();
        const breathe = 0.5 + 0.5 * Math.sin(time * 0.9);

        // Gyroscope / orbital rotations (production site style)
        if (hudRing) {
          hudRing.rotation.x = time * 0.15;
          hudRing.rotation.y = time * 0.3;
          hudRing.rotation.z = time * 0.1;
        }
        if (dotRing) {
          dotRing.rotation.x = time * -0.2;
          dotRing.rotation.y = time * 0.1;
          dotRing.rotation.z = time * -0.4;
        }
        if (scanRing) {
          scanRing.rotation.x = time * 0.25;
          scanRing.rotation.y = time * -0.2;
          scanRing.rotation.z = time * 0.15;
        }

        // Soft pulse — diamond “fire” without tinting the body
        if (rimLight) {
          rimLight.intensity = rimBaseIntensity * (0.92 + breathe * 0.12);
        }
        if (accentPoint) {
          accentPoint.intensity = 0.55 + breathe * 0.35;
        }
        if (crownLight) {
          // Occasional brighter crown sparkle
          crownLight.intensity = 5.2 + breathe * 1.4 + Math.max(0, Math.sin(time * 2.1)) * 1.2;
        }

        if (!isHovered) {
          mouse.targetX = time * 0.18;
          mouse.targetY = Math.sin(time * 0.42) * 0.045;

          // Specular crawls facets like a jewelry turntable light
          pointLight.position.x = Math.sin(time * 0.62) * 1.55;
          pointLight.position.y = 1.4 + Math.cos(time * 0.48) * 0.7;
          pointLight.position.z = 2.05 + Math.sin(time * 0.35) * 0.4;
          pointLight.intensity = pointBaseIntensity * (0.85 + breathe * 0.25);
        } else {
          const baseRotationY = Math.round(avatarGroup.rotation.y / (Math.PI * 2)) * (Math.PI * 2);
          mouse.targetX = baseRotationY + mouse.x * 0.7;
          mouse.targetY = mouse.y * 0.48;
          pointLight.intensity = pointBaseIntensity * 1.35;
        }

        // Slightly snappier tracking when hovered
        const lerp = isHovered ? 0.12 : 0.065;
        avatarGroup.rotation.y += (mouse.targetX - avatarGroup.rotation.y) * lerp;
        avatarGroup.rotation.x += (mouse.targetY - avatarGroup.rotation.x) * lerp;

        renderer.render(scene, camera);
      };

      animate();
    };

    const disposeThreeScene = () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }

      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
      }

      if (scene) {
        const disposedGeometries = new Set();
        const disposedMaterials = new Set();
        const disposedTextures = new Set();

        scene.traverse((object) => {
          if (object.geometry && !disposedGeometries.has(object.geometry)) {
            object.geometry.dispose();
            disposedGeometries.add(object.geometry);
          }

          if (object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((mat) => {
              if (!disposedMaterials.has(mat)) {
                if (mat.map && !disposedTextures.has(mat.map)) {
                  mat.map.dispose();
                  disposedTextures.add(mat.map);
                }
                mat.dispose();
                disposedMaterials.add(mat);
              }
            });
          }
        });
      }

      if (renderer) renderer.dispose();
    };

    let container = null;
    let handleMouseMove = null;
    let handleMouseLeave = null;

    Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js')
    ])
      .then(([THREE, gltfModule]) => {
        const { GLTFLoader } = gltfModule;
        if (!isMounted || !containerRef.current) return;

        initThree(THREE, GLTFLoader);

        container = containerRef.current;
        if (!container) return;

        intersectionObserver = new IntersectionObserver((entries) => {
          const entry = entries[0];
          const wasVisible = isVisible;
          isVisible = entry.isIntersecting;

          if (isVisible && !wasVisible) {
            cancelAnimationFrame(animationFrameId);
            clock.getDelta();
            animate(performance.now());
          }
        }, { threshold: 0.01 });
        intersectionObserver.observe(container);

        handleMouseMove = (e) => {
          isHovered = true;
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const normX = (x / rect.width) - 0.5;
          const normY = (y / rect.height) - 0.5;

          mouse.x = normX;
          mouse.y = normY;

          if (pointLight) {
            pointLight.position.x = normX * 2.8;
            pointLight.position.y = -normY * 2.2 + 0.55;
            pointLight.position.z = 2.8;
          }
          if (accentPoint) {
            accentPoint.position.x = -1.2 + normX * 0.6;
            accentPoint.position.y = 0.5 - normY * 0.4;
          }
        };

        handleMouseLeave = () => {
          isHovered = false;
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
      })
      .catch((error) => {
        console.error('Failed to load 3D avatar runtime:', error);
        if (isMounted) setLoadError(true);
      });

    return () => {
      if (container && handleMouseMove && handleMouseLeave) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      disposeThreeScene();
    };
  }, [loading, loadError, theme, themeColors]);

  // 2D Emitter Canvas Animation Loop
  useEffect(() => {
    if (loading) return;

    const canvas = emitterCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let lastSpawnTime = 0;
    let lastQuoteSpawnTime = performance.now();
    let particles = [];

    const ambientWords = quotesData[language]?.ambientWords || [];
    const quotes = quotesData[language]?.quotes || [];

    const spawnParticle = (text, type = 'word', customVel = null) => {
      const isQuote = type === 'quote';
      const lifeSpan = isQuote ? 7000 : 3000 + Math.random() * 1500;
      
      const p = {
        id: Math.random(),
        type,
        text: isQuote ? text.quote : text,
        author: isQuote ? text.author : null,
        // Spawn near the top/center of the 3D head
        x: 180 + (isQuote ? 0 : (Math.random() - 0.5) * 30),
        y: 230 + (isQuote ? 0 : (Math.random() - 0.5) * 15),
        vx: customVel ? customVel.x : (isQuote ? 0 : (Math.random() - 0.5) * 0.4),
        vy: customVel ? customVel.y : (isQuote ? -0.4 : -0.8 - Math.random() * 0.6),
        seed: Math.random() * 100,
        driftAmp: isQuote ? 0 : 8 + Math.random() * 12,
        driftFreq: isQuote ? 0 : 0.0015 + Math.random() * 0.0015,
        fontSize: isQuote ? 11 : 9 + Math.floor(Math.random() * 4),
        colorType: Math.random() > 0.45 ? 'primary' : 'secondary',
        maxAlpha: isQuote ? 0.95 : 0.45 + Math.random() * 0.25,
        createdAt: performance.now(),
        lifeSpan
      };
      
      if (isQuote) {
        // Remove existing quotes to avoid overlapping
        particles = particles.filter(pt => pt.type !== 'quote');
      }
      particles.push(p);
    };

    // Expose the manual trigger function
    triggerQuoteRef.current = () => {
      if (quotes.length === 0) return;

      // 1. Pick a quote
      let index = Math.floor(Math.random() * quotes.length);
      if (quotes.length > 1 && index === lastQuoteIndexRef.current) {
        index = (index + 1) % quotes.length;
      }
      lastQuoteIndexRef.current = index;
      
      spawnParticle(quotes[index], 'quote');

      // 2. Spawn a mini burst of 5 ambient words around it
      if (ambientWords.length > 0) {
        for (let i = 0; i < 5; i++) {
          const word = ambientWords[Math.floor(Math.random() * ambientWords.length)];
          const angle = (Math.PI * 2 / 5) * i + (Math.random() - 0.5) * 0.3;
          const speed = 0.8 + Math.random() * 0.5;
          spawnParticle(word, 'word', {
            x: Math.cos(angle) * speed,
            y: -1.0 - Math.random() * 0.4
          });
        }
      }
      
      // Reset auto timer
      lastQuoteSpawnTime = performance.now();
    };

    let isVisible = false;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 24;

    const animate = (time) => {
      if (!isVisible) return;
      animationId = requestAnimationFrame(animate);

      if (time) {
        const elapsed = time - lastFrameTime;
        if (elapsed < frameInterval) return;
        lastFrameTime = time - (elapsed % frameInterval);
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn ambient words
      if (time - lastSpawnTime > 1500) {
        if (ambientWords.length > 0) {
          const word = ambientWords[Math.floor(Math.random() * ambientWords.length)];
          spawnParticle(word, 'word');
        }
        lastSpawnTime = time;
      }

      // Auto spawn quotes every 12 seconds
      if (time - lastQuoteSpawnTime > 12000) {
        if (triggerQuoteRef.current) {
          triggerQuoteRef.current();
        }
      }

      // Update and draw particles
      particles = particles.filter((p) => {
        const elapsed = time - p.createdAt;
        const progress = elapsed / p.lifeSpan;

        if (progress >= 1.0) return false;

        // Position update
        let currentX = p.x + p.vx * (elapsed / 16);
        let currentY = p.y + p.vy * (elapsed / 16);

        // Apply drift
        if (p.type === 'word') {
          currentX += Math.sin(time * p.driftFreq + p.seed) * p.driftAmp * 0.05;
        }

        // Calculate opacity
        let alpha = p.maxAlpha;
        if (p.type === 'quote') {
          if (progress < 0.15) {
            alpha = (progress / 0.15) * p.maxAlpha;
          } else if (progress > 0.7) {
            alpha = ((1.0 - progress) / 0.3) * p.maxAlpha;
          }
        } else {
          if (progress < 0.2) {
            alpha = (progress / 0.2) * p.maxAlpha;
          } else if (progress > 0.6) {
            alpha = ((1.0 - progress) / 0.4) * p.maxAlpha;
          }
        }

        alpha = Math.max(0, Math.min(alpha, 1.0));

        // Draw particle
        if (p.type === 'quote') {
          ctx.font = 'bold 11px "Space Grotesk", sans-serif';
          const lines = wrapText(ctx, p.text, 220);
          drawQuoteCapsule(ctx, lines, p.author, currentX, currentY, themeColors, alpha);
        } else {
          drawWord(ctx, p.text, currentX, currentY, alpha, themeColors, p.fontSize, p.colorType);
        }

        return true;
      });
    };

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const wasVisible = isVisible;
      isVisible = entry.isIntersecting;

      if (isVisible && !wasVisible) {
        cancelAnimationFrame(animationId);
        lastQuoteSpawnTime = performance.now();
        lastSpawnTime = performance.now();
        lastFrameTime = performance.now();
        particles = []; // clear particles on resume for a clean slate
        animate(lastFrameTime);
      }
    }, { threshold: 0.01 });

    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [language, themeColors, loading]);

  const handleAvatarClick = () => {
    if (triggerQuoteRef.current) {
      triggerQuoteRef.current();
    }
  };

  return (
    <div 
      onClick={handleAvatarClick}
      className="relative inline-block mb-8 group cursor-pointer select-none"
    >
      {/* Soft outer bloom (like button ambient glow) */}
      <div className="absolute -inset-4 rounded-full bg-cyber-cyan/12 blur-2xl opacity-50 group-hover:opacity-80 group-hover:bg-cyber-cyan/20 transition duration-700 pointer-events-none" />

      {/* Thought Stream Emitter Canvas Overlay */}
      <canvas
        ref={emitterCanvasRef}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-30"
        style={{ width: '360px', height: '420px' }}
        width={360}
        height={420}
      />

      {/* Main container — larger circle; head kept same size via camera distance */}
      <div className="relative w-72 h-72 rounded-full overflow-hidden bg-black flex items-center justify-center border border-[rgba(var(--primary-color-rgb),0.3)] shadow-[0_4px_15px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(var(--primary-color-rgb),0.25),0_0_18px_rgba(var(--primary-color-rgb),0.12)] transition-all duration-500 group-hover:border-[rgba(var(--primary-color-rgb),0.55)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(var(--primary-color-rgb),0.35),0_0_22px_rgba(var(--primary-color-rgb),0.28)]">
        {loadError && (
          <img
            src={profile?.avatar_url || '/avatar-320.jpg'}
            alt={profile?.name || 'Avatar'}
            width={288}
            height={288}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}

        {/* Very soft scanline — texture, not distraction */}
        {!loadError && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-full mix-blend-screen">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent animate-scanline opacity-35" />
          </div>
        )}

        {/* WebGL Canvas */}
        {!loadError && (
          <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full flex items-center justify-center z-10"
          />
        )}

        {/* Loading Progress */}
        {!loadError && !modelLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-black/95 z-30 pointer-events-none">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Outer spinning tech ring */}
              <div className="absolute inset-0 border border-dashed border-cyber-cyan/30 rounded-full animate-[spin_8s_linear_infinite]"></div>
              <div className="absolute -inset-1 border border-cyber-purple/20 rounded-full animate-[spin_12s_linear_infinite]"></div>
              
              {/* Percentage Text */}
              <div className="flex flex-col items-center">
                <span className="font-mono text-sm text-cyber-cyan font-bold tracking-wider">
                  {progress}%
                </span>
                <span className="font-mono text-[7px] text-cyber-cyan/50 tracking-widest uppercase mt-0.5 animate-pulse">
                  SYS_LOAD
                </span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-36 h-1 bg-cyber-cyan/10 rounded-full mt-3 overflow-hidden border border-cyber-cyan/20">
              <div 
                className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple transition-all duration-300 shadow-[0_0_8px_var(--primary-color)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveAvatar;
