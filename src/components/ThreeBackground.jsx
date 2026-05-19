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
        scene.fog = new THREE.FogExp2(0x050505, 0.006);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        mountEl.appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const count = 3600;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const coreColor = new THREE.Color(0xf0fbff);
        const cyan = new THREE.Color(0x22d3ee);
        const violet = new THREE.Color(0xa855f7);
        const magenta = new THREE.Color(0xec4899);
        const deepBlue = new THREE.Color(0x2563eb);

        // Distribute particles in a cosmic galactic spiral disk on load
        for (let i = 0; i < count; i++) {
            const isCore = Math.random() < 0.18;
            const arm = Math.floor(Math.random() * 3);
            const r = isCore
                ? Math.pow(Math.random(), 1.8) * 9
                : 8 + Math.pow(Math.random(), 0.75) * 29;
            const theta = arm * ((Math.PI * 2) / 3) + r * 0.18 + (Math.random() - 0.5) * 1.25;
            const diskTilt = 0.42;
            const localZ = (Math.random() - 0.5) * (isCore ? 7 : 4);
            const y = r * Math.sin(theta) * Math.cos(diskTilt) - localZ * Math.sin(diskTilt);
            const z = r * Math.sin(theta) * Math.sin(diskTilt) + localZ * Math.cos(diskTilt);
            
            positions[i * 3] = r * Math.cos(theta);
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Initialize orbital speed perpendicular to the center to orbit immediately
            const speed = Math.sqrt(Math.max(r, 1)) * 0.035;
            velocities[i * 3] = -Math.sin(theta) * speed;
            velocities[i * 3 + 1] = Math.cos(theta) * speed;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

            const radialMix = Math.min(r / 38, 1);
            const mixed = coreColor.clone().lerp(Math.random() > 0.45 ? cyan : violet, radialMix);
            if (Math.random() > 0.86) mixed.lerp(magenta, 0.45);
            if (Math.random() > 0.82) mixed.lerp(deepBlue, 0.35);
            colors[i * 3] = mixed.r;
            colors[i * 3 + 1] = mixed.g;
            colors[i * 3 + 2] = mixed.b;
            sizes[i] = isCore ? 0.45 + Math.random() * 0.55 : 0.16 + Math.random() * 0.42;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

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
        const material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: texture },
                opacity: { value: 0.84 }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vColor = color;
                    vAlpha = mix(0.48, 1.0, smoothstep(42.0, 4.0, length(position)));
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = clamp(size * (330.0 / -mvPosition.z), 1.0, 16.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                uniform float opacity;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 tex = texture2D(pointTexture, gl_PointCoord);
                    vec3 glow = vColor * (0.85 + vAlpha * 0.35);
                    gl_FragColor = vec4(glow, tex.a * vAlpha * opacity);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending, // Overlapping particles glow brighter!
            depthWrite: false,
            vertexColors: true
        });

        const particles = new THREE.Points(geometry, material);
        particles.rotation.x = -0.18;
        scene.add(particles);

        const coreTexture = createCircleTexture();
        const coreMaterial = new THREE.SpriteMaterial({
            map: coreTexture,
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.26,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const coreGlow = new THREE.Sprite(coreMaterial);
        coreGlow.scale.set(18, 18, 1);
        coreGlow.position.set(0, 0, 1);
        scene.add(coreGlow);

        const haloMaterial = new THREE.SpriteMaterial({
            map: coreTexture,
            color: 0xa855f7,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const haloGlow = new THREE.Sprite(haloMaterial);
        haloGlow.scale.set(38, 38, 1);
        haloGlow.position.set(0, 0, -2);
        scene.add(haloGlow);

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

                    const swirlM = 0.018 * (1 - dm / 30);
                    ax += -dy * swirlM;
                    ay += dx * swirlM;
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
            coreGlow.material.opacity = 0.22 + Math.sin(Date.now() * 0.0012) * 0.04;
            coreGlow.rotation.z -= 0.0007;
            haloGlow.rotation.z += 0.00025;

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
            coreTexture.dispose();
            coreMaterial.dispose();
            haloMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div ref={mountRef} className="absolute inset-0" />
            <div className="background-vignette" />
        </div>
    );
};

export default ThreeBackground;
