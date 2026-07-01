import React, { useEffect, useRef, useState } from 'react';
import { quotesData } from '../data/quotes';

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

// Helper to draw a stylized quote capsule
const drawQuoteCapsule = (ctx, lines, author, x, y, colors, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = 'bold 11px "Space Grotesk", sans-serif';
  let maxLineWidth = 0;
  lines.forEach(line => {
    const w = ctx.measureText(line).width;
    if (w > maxLineWidth) maxLineWidth = w;
  });

  ctx.font = '9px "Fira Code", monospace';
  const authorWidth = ctx.measureText(`— ${author}`).width;

  const contentWidth = Math.max(maxLineWidth, authorWidth);
  const capsuleWidth = Math.min(270, contentWidth + 24);
  
  const quoteLineHeight = 14;
  const authorLineHeight = 12;
  const paddingY = 16;
  const capsuleHeight = lines.length * quoteLineHeight + authorLineHeight + paddingY;

  const rectX = x - capsuleWidth / 2;
  const rectY = y - capsuleHeight / 2;
  const radius = 8;

  ctx.shadowColor = `rgba(${colors.primaryRgb}, 0.45)`;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = `rgba(${colors.primaryRgb}, 0.75)`;
  ctx.lineWidth = 1.5;

  ctx.fillStyle = 'rgba(5, 8, 17, 0.92)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(rectX, rectY, capsuleWidth, capsuleHeight, radius);
  } else {
    ctx.rect(rectX, rectY, capsuleWidth, capsuleHeight);
  }
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = 'bold 11px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  lines.forEach((line, index) => {
    const lineY = rectY + 10 + index * quoteLineHeight;
    ctx.fillText(line, x, lineY);
  });

  ctx.fillStyle = `rgba(${colors.secondaryRgb}, 0.95)`;
  ctx.font = '9px "Fira Code", monospace';
  const authorY = rectY + 10 + lines.length * quoteLineHeight + 2;
  ctx.fillText(`— ${author}`, x, authorY);

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
    let keyLight, fillLight, rimLight, pointLight;
    let hudRing, dotRing, scanRing;
    let animationFrameId;
    const activePointsMaterials = [];

    // Mouse interpolation state
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let isHovered = false;

    const createDotTexture = (THREE, colors) => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.3, `rgba(${colors.primaryRgb}, 0.85)`);
      gradient.addColorStop(0.7, `rgba(${colors.secondaryRgb}, 0.25)`);
      gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);

      return new THREE.CanvasTexture(canvas);
    };

    const initThree = (THREE, GLTFLoader) => {
      if (!containerRef.current) return;

      const width = 256;
      const height = 256;

      // 1. Scene setup
      scene = new THREE.Scene();

      // 2. Camera setup - PerspectiveCamera is perfect for volumetric 3D depth
      camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.z = 4.2;

      // 3. Renderer setup
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);

      avatarGroup = new THREE.Group();
      scene.add(avatarGroup);

      // 4. Lighting Config for Cyberpunk / Tech aesthetics
      // Soft ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      // Key light - Cyan from top-front-right
      keyLight = new THREE.DirectionalLight(themeColors.primaryHex, 1.8);
      keyLight.position.set(4, 4, 3);
      scene.add(keyLight);

      // Fill light - Purple/Magenta from front-left to catch the other side
      fillLight = new THREE.DirectionalLight(themeColors.secondaryHex, 1.2);
      fillLight.position.set(-4, 2, 2);
      scene.add(fillLight);

      // Rim light - White from behind-top to create nice edge glow
      rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
      rimLight.position.set(0, 5, -5);
      scene.add(rimLight);

      // Point Light for Specular Glare (mouse tracking)
      pointLight = new THREE.PointLight(0xffffff, 4.0, 10);
      pointLight.position.set(0, 0, 2.5);
      scene.add(pointLight);

      // 5. Outer HUD rings (gyroscopic orbital scanning rings)
      const ringGeom = new THREE.RingGeometry(1.42, 1.44, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: themeColors.primaryHex,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      });
      hudRing = new THREE.Mesh(ringGeom, ringMat);
      hudRing.position.set(0, -0.25, 0); // Center around the head
      avatarGroup.add(hudRing);

      // Technical dotted ring
      const dotRingGeom = new THREE.RingGeometry(1.50, 1.51, 32);
      const dotRingMat = new THREE.MeshBasicMaterial({
        color: themeColors.secondaryHex,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
        side: THREE.DoubleSide
      });
      dotRing = new THREE.Mesh(dotRingGeom, dotRingMat);
      dotRing.position.set(0, -0.25, 0);
      avatarGroup.add(dotRing);

      // Thin outermost scan ring
      const scanRingGeom = new THREE.RingGeometry(1.58, 1.59, 64);
      const scanRingMat = new THREE.MeshBasicMaterial({
        color: themeColors.primaryHex,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
      scanRing = new THREE.Mesh(scanRingGeom, scanRingMat);
      scanRing.position.set(0, -0.25, 0);
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

          // Calculate scale factor to make it fit nicely
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            // Increased targetSize to 2.8 so that the head fills the frame,
            // and the cut-off neck is cropped out by the container borders
            const targetSize = 2.8;
            const scale = targetSize / maxDim;
            modelContainer.scale.set(scale, scale, scale);
          }

          // Offset the container downward slightly so the flat neck base is pushed
          // out of the circle frame and clipped by overflow-hidden
          modelContainer.position.y = -0.25;

          // Create the glowing dot texture
          const dotTexture = createDotTexture(THREE, themeColors);

          // Traverse model and apply hybrid cyberpunk rendering (cyber-glass + glowing particles)
          const meshes = [];
          model.traverse((node) => {
            if (node.isMesh) {
              meshes.push(node);
            }
          });

          meshes.forEach((mesh) => {
            // Restore the dark glass base mesh to occlude back-face particles and provide structure
            mesh.visible = true;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Semi-transparent dark glass material with depth writing and polygon offset to prevent depth fighting
            const cyberGlassMat = new THREE.MeshStandardMaterial({
              color: 0x050811,
              roughness: 0.15,
              metalness: 0.9,
              transparent: true,
              opacity: 0.45,
              side: THREE.DoubleSide,
              depthWrite: true,
              polygonOffset: true,
              polygonOffsetFactor: 1,
              polygonOffsetUnits: 1
            });

            // Dispose of the original material
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat) => mat.dispose());
              } else {
                mesh.material.dispose();
              }
            }
            mesh.material = cyberGlassMat;

            // Holographic glowing particle overlay using downsampled geometry to reduce density
            const pointsMat = new THREE.PointsMaterial({
              color: themeColors.primaryHex,
              size: 0.02, // Slightly larger particles for better visibility with lower density
              sizeAttenuation: true,
              transparent: true,
              opacity: 0.85,
              blending: THREE.AdditiveBlending,
              map: dotTexture,
              depthWrite: false,
            });
            activePointsMaterials.push(pointsMat);

            let pointsGeometry;
            const positionAttr = mesh.geometry.attributes.position;
            if (positionAttr) {
              pointsGeometry = new THREE.BufferGeometry();
              const originalPositions = positionAttr.array;
              const step = 2; // Keep every 2nd vertex (gives ~31k points) for a refined look
              const newPositions = [];
              for (let i = 0; i < originalPositions.length; i += 3 * step) {
                newPositions.push(originalPositions[i], originalPositions[i + 1], originalPositions[i + 2]);
              }
              pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
            } else {
              pointsGeometry = mesh.geometry;
            }

            const pointCloud = new THREE.Points(pointsGeometry, pointsMat);
            // Sync local transform
            pointCloud.position.copy(mesh.position);
            pointCloud.rotation.copy(mesh.rotation);
            pointCloud.scale.copy(mesh.scale);

            mesh.parent.add(pointCloud);
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

      // 7. Animation Loop
      clock = new THREE.Clock();
      let lastRenderTime = 0;
      const frameInterval = 1000 / 30;

      // Pre-allocated color objects — reused every frame to avoid GC pressure
      const _primaryColor   = new THREE.Color();
      const _secondaryColor = new THREE.Color();
      const _currentColor   = new THREE.Color();

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

        // Gyroscope/orbital rotations on different axes for a 3D scan sphere effect
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

        if (!isHovered) {
          // Idle state: Smooth continuous Y-axis rotation (spin the model)
          // Also apply a subtle nodding motion
          mouse.targetX = time * 0.35;
          mouse.targetY = Math.sin(time * 0.8) * 0.08;

          // Light tracks a path
          pointLight.position.x = Math.sin(time) * 1.5;
          pointLight.position.y = Math.cos(time) * 1.5;
        } else {
          // Hover state: Align Y rotation to match mouse tilt
          const baseRotationY = Math.round(avatarGroup.rotation.y / (Math.PI * 2)) * (Math.PI * 2);
          mouse.targetX = baseRotationY + (mouse.x * 0.65); // target yaw
          mouse.targetY = mouse.y * 0.45;                   // target pitch
        }

        // Apply smooth interpolation (lerp)
        avatarGroup.rotation.y += (mouse.targetX - avatarGroup.rotation.y) * 0.08;
        avatarGroup.rotation.x += (mouse.targetY - avatarGroup.rotation.x) * 0.08;

        // Dynamic color transition between cyan and purple (oscillates at 0.8 rad/s)
        const colorWeight = (Math.sin(time * 0.8) + 1.0) / 2.0;
        _primaryColor.set(themeColors.primaryHex);
        _secondaryColor.set(themeColors.secondaryHex);
        _currentColor.copy(_primaryColor).lerp(_secondaryColor, colorWeight);

        activePointsMaterials.forEach((mat) => {
          mat.color.copy(_currentColor);
        });

        // Render scene
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
            pointLight.position.x = normX * 3.5;
            pointLight.position.y = -normY * 3.5;
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
        x: 160 + (isQuote ? 0 : (Math.random() - 0.5) * 30),
        y: 210 + (isQuote ? 0 : (Math.random() - 0.5) * 15),
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
      {/* Outer pulsing glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-cyan rounded-full blur-md opacity-30 group-hover:opacity-70 transition duration-500 animate-pulse"></div>

      {/* Thought Stream Emitter Canvas Overlay */}
      <canvas
        ref={emitterCanvasRef}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-30"
        style={{ width: '320px', height: '384px' }}
        width={320}
        height={384}
      />

      {/* Main container */}
      <div className="relative w-64 h-64 rounded-full overflow-hidden border border-cyber-cyan/30 bg-cyber-black flex items-center justify-center">
        {loadError && (
          <img
            src={profile?.avatar_url || '/avatar-320.jpg'}
            alt={profile?.name || 'Avatar'}
            width={256}
            height={256}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}

        {/* Holographic scanner line overlay */}
        {!loadError && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-full">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent shadow-[0_0_8px_var(--primary-color)] animate-scanline opacity-60"></div>
          </div>
        )}

        {/* Diagnostic HUD text */}
        {!loadError && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 font-mono text-[7px] text-cyber-cyan/60 tracking-widest z-10 uppercase pointer-events-none group-hover:text-cyber-cyan transition-colors">
            GLB_3D_SECURE
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
