import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Icon from './Icon';

// Helper to generate a soft circular glow texture for points/particles.
const createDotTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.3, 'rgba(34, 211, 238, 0.85)'); // Cyan core
  gradient.addColorStop(0.7, 'rgba(168, 85, 247, 0.25)'); // Purple glow
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);
  
  return new THREE.CanvasTexture(canvas);
};

const InteractiveAvatar = ({ profile, loading }) => {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (loading) return;

    let isMounted = true;
    let renderer, scene, camera;
    let modelContainer, avatarGroup;
    let keyLight, fillLight, rimLight, pointLight;
    let hudRing, dotRing, scanRing;
    let animationFrameId;
    const activePointsMaterials = [];

    // Mouse interpolation state
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let isHovered = false;

    const initThree = () => {
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
      keyLight = new THREE.DirectionalLight(0x22d3ee, 1.8);
      keyLight.position.set(4, 4, 3);
      scene.add(keyLight);

      // Fill light - Purple/Magenta from front-left to catch the other side
      fillLight = new THREE.DirectionalLight(0xa855f7, 1.2);
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
        color: 0x22d3ee,
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
        color: 0xa855f7,
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
        color: 0x22d3ee,
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
          if (!isMounted) return;

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
          const dotTexture = createDotTexture();

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
              color: 0x22d3ee,
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
      const clock = new THREE.Clock();

      const animate = () => {
        if (!isMounted) return;

        animationFrameId = requestAnimationFrame(animate);

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
        const cyanColor = new THREE.Color(0x22d3ee);
        const purpleColor = new THREE.Color(0xa855f7);
        const currentColor = cyanColor.clone().lerp(purpleColor, colorWeight);

        activePointsMaterials.forEach((mat) => {
          mat.color.copy(currentColor);
        });

        // Render scene
        renderer.render(scene, camera);
      };

      animate();
    };

    initThree();

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      isHovered = true;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalize between -0.5 and 0.5
      const normX = (x / rect.width) - 0.5;
      const normY = (y / rect.height) - 0.5;

      // Set mouse target values
      mouse.x = normX;
      mouse.y = normY;

      // Move point light to track cursor for glossy reflections
      if (pointLight) {
        pointLight.position.x = normX * 3.5;
        pointLight.position.y = -normY * 3.5;
      }
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.innerHTML = '';
      }
      
      // Dispose of scene resources without duplicating or missing shared objects
      if (scene) {
        const disposedGeometries = new Set();
        const disposedMaterials = new Set();
        const disposedTextures = new Set();

        scene.traverse((object) => {
          // Dispose geometry (shared between mesh and points)
          if (object.geometry && !disposedGeometries.has(object.geometry)) {
            object.geometry.dispose();
            disposedGeometries.add(object.geometry);
          }

          // Dispose materials and textures
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
  }, [loading]);

  if (loadError) {
    // Elegant fallback to avatar image if GLB load fails
    return (
      <div className="relative inline-block mb-8 group cursor-pointer">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
        <img
          src={profile?.avatar_url || '/avatar-320.jpg'}
          alt="Avatar Fallback"
          width="256"
          height="256"
          className="relative w-64 h-64 rounded-full border-2 border-black object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative inline-block mb-8 group cursor-pointer select-none">
      {/* Outer pulsing glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-cyan rounded-full blur-md opacity-30 group-hover:opacity-70 transition duration-500 animate-pulse"></div>

      {/* Main container */}
      <div className="relative w-64 h-64 rounded-full overflow-hidden border border-cyber-cyan/30 bg-cyber-black/80 flex items-center justify-center">
        {/* Holographic scanner line overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-full">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent shadow-[0_0_8px_#22d3ee] animate-scanline opacity-60"></div>
        </div>

        {/* Diagnostic HUD text */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 font-mono text-[7px] text-cyber-cyan/60 tracking-widest z-10 uppercase pointer-events-none group-hover:text-cyber-cyan transition-colors">
          GLB_3D_SECURE
        </div>

        {/* WebGL Canvas */}
        <div
          ref={containerRef}
          className="w-64 h-64 flex items-center justify-center"
        />

        {/* Loading Progress */}
        {!modelLoaded && (
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
                className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple transition-all duration-300 shadow-[0_0_8px_#22d3ee]"
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
