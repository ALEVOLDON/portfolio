import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
    const mountRef = useRef(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Map mouse 2D coords to 3D world space at z = 0
            mousePos.current = {
                x: ((e.clientX / window.innerWidth) * 2 - 1) * 28,
                y: -((e.clientY / window.innerHeight) * 2 - 1) * 16
            };
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;
        const mountEl = mountRef.current;
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050505, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountEl.appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        
        const color1 = new THREE.Color(0x22d3ee); // Cyber Cyan
        const color2 = new THREE.Color(0xa855f7); // Cyber Purple

        // Distribute particles in a cosmic galactic spiral disk on load
        for (let i = 0; i < count; i++) {
            const r = 8 + 25 * Math.random(); // radial distance from galactic core
            const theta = Math.random() * Math.PI * 2;
            const z = (Math.random() - 0.5) * 6; // galactic disk thickness
            
            positions[i * 3] = r * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(theta);
            positions[i * 3 + 2] = z;

            // Initialize orbital speed perpendicular to the center to orbit immediately
            const speed = Math.sqrt(r) * 0.04;
            velocities[i * 3] = -Math.sin(theta) * speed;
            velocities[i * 3 + 1] = Math.cos(theta) * speed;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

            const mixed = Math.random() > 0.55 ? color1 : color2;
            colors[i * 3] = mixed.r;
            colors[i * 3 + 1] = mixed.g;
            colors[i * 3 + 2] = mixed.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create a custom soft circular glow texture dynamically in JS memory
        const createCircleTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 16, 16);
            
            return new THREE.CanvasTexture(canvas);
        };

        const texture = createCircleTexture();
        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            map: texture,
            blending: THREE.AdditiveBlending, // Overlapping particles glow brighter!
            depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);

            const posAttr = geometry.attributes.position;
            const posArray = posAttr.array;

            const mx = mousePos.current.x;
            const my = mousePos.current.y;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                let x = posArray[i3];
                let y = posArray[i3 + 1];
                let z = posArray[i3 + 2];

                let vx = velocities[i3];
                let vy = velocities[i3 + 1];
                let vz = velocities[i3 + 2];

                // 1. Gravity from center (galactic core)
                const dc = Math.sqrt(x*x + y*y + z*z) || 1;
                const forceC = 0.2 / (dc * dc + 6.0); // central gravitational force
                let ax = -x * forceC;
                let ay = -y * forceC;
                let az = -z * forceC;

                // Spiral galactic rotation force (orbital velocity acceleration)
                const swirl = 0.012;
                ax += -y * (swirl / dc);
                ay += x * (swirl / dc);

                // 2. Dynamic Gravity from Mouse Attractor
                const dx = mx - x;
                const dy = my - y;
                const dz = 0 - z;
                const dm = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
                
                if (dm < 30) {
                    const forceM = 0.65 / (dm * dm + 8.0); // space curvature / mass pull
                    ax += dx * forceM;
                    ay += dy * forceM;
                    az += dz * forceM;
                }

                // 3. Update Velocities
                vx += ax;
                vy += ay;
                vz += az;

                // Add physical damping (friction)
                vx *= 0.975;
                vy *= 0.975;
                vz *= 0.975;

                // 4. Update Positions
                x += vx;
                y += vy;
                z += vz;

                // Recycling out-of-bounds particles back to outer orbits
                const dist = Math.sqrt(x*x + y*y + z*z);
                if (dist > 50) {
                    const theta = Math.random() * Math.PI * 2;
                    x = 40 * Math.cos(theta);
                    y = 40 * Math.sin(theta);
                    z = (Math.random() - 0.5) * 4;
                    vx = -Math.sin(theta) * 0.08;
                    vy = Math.cos(theta) * 0.08;
                    vz = 0;
                }

                posArray[i3] = x;
                posArray[i3 + 1] = y;
                posArray[i3 + 2] = z;

                velocities[i3] = vx;
                velocities[i3 + 1] = vy;
                velocities[i3 + 2] = vz;
            }

            posAttr.needsUpdate = true;

            // Slowly orbit the entire galaxy for rotational parallax depth
            particles.rotation.z += 0.0002;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            if (renderer.domElement && mountEl.contains(renderer.domElement)) {
                mountEl.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            texture.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />;
};

export default ThreeBackground;
