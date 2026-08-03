import React, { useEffect, useRef } from 'react';

const themeHex = (theme) => {
  switch (theme) {
    case 'solar':
      return { primary: 0xf2994a, secondary: 0xeb5757 };
    case 'emerald':
      return { primary: 0x22c55e, secondary: 0x0f766e };
    case 'void':
      return { primary: 0xd1d5db, secondary: 0x6b7280 };
    case 'cyber':
    default:
      return { primary: 0x22d3ee, secondary: 0xa855f7 };
  }
};

/**
 * Same gyro HUD rings as InteractiveAvatar (RingGeometry + multi-axis spin).
 * Lightweight Three scene used by VideoAvatar so both modes match.
 */
const AvatarHudRings = ({ theme = 'cyber' }) => {
  const mountRef = useRef(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!mountRef.current) return;

    let isMounted = true;
    let renderer;
    let scene;
    let camera;
    let hudRing;
    let dotRing;
    let scanRing;
    let frameId;
    let clock;
    let isVisible = true;

    const mountEl = mountRef.current;

    Promise.all([import('three')]).then(([THREE]) => {
      if (!isMounted || !mountRef.current) return;

      const size = 288;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 0.12, 4.33);
      camera.lookAt(0, -0.05, 0);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      mountEl.innerHTML = '';
      mountEl.appendChild(renderer.domElement);

      const colors = themeHex(themeRef.current);
      const ringY = -0.22;
      const group = new THREE.Group();
      scene.add(group);

      const makeRing = (inner, outer, color, opacity, segments = 64, wireframe = false) => {
        const mesh = new THREE.Mesh(
          new THREE.RingGeometry(inner, outer, segments),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            side: THREE.DoubleSide,
            depthWrite: false,
            wireframe,
          })
        );
        mesh.position.set(0, ringY, 0);
        group.add(mesh);
        return mesh;
      };

      // Match InteractiveAvatar radii / opacities
      hudRing = makeRing(1.42, 1.44, colors.primary, 0.45, 64, false);
      dotRing = makeRing(1.5, 1.51, colors.secondary, 0.35, 32, true);
      scanRing = makeRing(1.58, 1.59, colors.primary, 0.25, 64, false);

      clock = new THREE.Clock();
      let lastFrame = 0;
      const frameInterval = 1000 / 30;

      const animate = (timestamp = 0) => {
        if (!isMounted) return;
        frameId = requestAnimationFrame(animate);
        if (!isVisible) return;

        if (timestamp) {
          const elapsed = timestamp - lastFrame;
          if (elapsed < frameInterval) return;
          lastFrame = timestamp - (elapsed % frameInterval);
        }

        // Live theme color updates without remount
        const live = themeHex(themeRef.current);
        if (hudRing?.material) hudRing.material.color.setHex(live.primary);
        if (dotRing?.material) dotRing.material.color.setHex(live.secondary);
        if (scanRing?.material) scanRing.material.color.setHex(live.primary);

        const time = clock.getElapsedTime();
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

        renderer.render(scene, camera);
      };

      const observer = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
          if (isVisible) {
            clock.getDelta();
            lastFrame = performance.now();
          }
        },
        { threshold: 0.01 }
      );
      observer.observe(mountEl);

      animate(performance.now());

      // Stash for cleanup
      mountEl.__hudCleanup = () => {
        observer.disconnect();
        cancelAnimationFrame(frameId);
        scene?.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        renderer?.dispose();
        if (mountEl.contains(renderer?.domElement)) {
          mountEl.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      isMounted = false;
      if (mountEl.__hudCleanup) {
        mountEl.__hudCleanup();
        delete mountEl.__hudCleanup;
      }
      mountEl.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-[15] pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default AvatarHudRings;
