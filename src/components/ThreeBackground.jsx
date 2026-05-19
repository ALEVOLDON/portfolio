import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
    const mountRef = useRef(null);
    const mousePos = useRef({ x: 0, y: 0, rawX: 0, rawY: 0 });
    const smoothedMouse = useRef({ x: 0, y: 0, rawX: 0, rawY: 0 });
    const velocities = useRef([]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Map mouse 2D coords to 3D world space coordinates
            mousePos.current = {
                x: ((e.clientX / window.innerWidth) * 2 - 1) * 35,
                y: -((e.clientY / window.innerHeight) * 2 - 1) * 20,
                rawX: (e.clientX / window.innerWidth) * 2 - 1,
                rawY: -((e.clientY / window.innerHeight) * 2 - 1)
            };
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;
        const mountEl = mountRef.current;
        const scene = new THREE.Scene();
        const clock = new THREE.Clock();

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        mountEl.appendChild(renderer.domElement);

        // ==========================================
        // LAYER 1 & 2: BACKGROUND SHADER PLANE
        // ==========================================
        const bgMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uMouse: { value: new THREE.Vector2(0, 0) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec2 uMouse;
                varying vec2 vUv;

                // ashima simplex 3D noise
                vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
                vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

                float snoise(vec3 v){
                  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

                  vec3 i  = floor(v + dot(v, C.yyy) );
                  vec3 x0 =   v - i + dot(i, C.xxx) ;

                  vec3 g = step(x0.yzx, x0.xyz);
                  vec3 l = 1.0 - g;
                  vec3 i1 = min( g.xyz, l.zxy );
                  vec3 i2 = max( g.xyz, l.zxy );

                  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
                  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
                  vec3 x3 = x0 - D.yyy;

                  i = mod(i, 289.0 );
                  vec4 p = permute( permute( permute(
                             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

                  float n_ = 0.142857142857;
                  vec3  ns = n_ * D.wyz - D.xzx;

                  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

                  vec4 x_ = floor(j * ns.z);
                  vec4 y_ = floor(j - 7.0 * x_ );

                  vec4 x = x_ *ns.x + ns.yyyy;
                  vec4 y = y_ *ns.x + ns.yyyy;
                  vec4 h = 1.0 - abs(x) - abs(y);

                  vec4 b0 = vec4( x.xy, y.xy );
                  vec4 b1 = vec4( x.zw, y.zw );

                  vec4 s0 = floor(b0)*2.0 + 1.0;
                  vec4 s1 = floor(b1)*2.0 + 1.0;
                  vec4 sh = -step(h, vec4(0.0));

                  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

                  vec3 p0 = vec3(a0.xy,h.x);
                  vec3 p1 = vec3(a0.zw,h.y);
                  vec3 p2 = vec3(a1.xy,h.z);
                  vec3 p3 = vec3(a1.zw,h.w);

                  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                  p0 *= norm.x;
                  p1 *= norm.y;
                  p2 *= norm.z;
                  p3 *= norm.w;

                  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                  m = m * m;
                  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                                dot(p2,x2), dot(p3,x3) ) );
                }

                void main() {
                    // Aspect ratio correction
                    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

                    // Large glow fields control points (drifting dynamically with slow LFOs and eased mouse inertia)
                    vec2 cp1 = vec2(0.25 * sin(uTime * 0.05), 0.18 * cos(uTime * 0.04)) + uMouse * 0.14;
                    vec2 cp2 = vec2(0.3 * cos(uTime * 0.038), 0.22 * sin(uTime * 0.052)) - uMouse * 0.10;
                    vec2 cp3 = vec2(0.22 * sin(uTime * 0.032 + 1.2), 0.26 * cos(uTime * 0.046 - 0.8)) + uMouse * 0.07;

                    // Apply multi-octave 3D simplex noise distortion to UV coordinates (organic fluid motion)
                    vec2 noiseUv = uv * 1.5;
                    float nX = snoise(vec3(noiseUv, uTime * 0.016));
                    float nY = snoise(vec3(noiseUv + vec2(13.4, 27.8), uTime * 0.018));
                    vec2 distortedUv = uv + vec2(nX, nY) * 0.16;

                    // Distance fields to attractors
                    float d1 = length(distortedUv - cp1);
                    float d2 = length(distortedUv - cp2);
                    float d3 = length(distortedUv - cp3);

                    // Soft Gaussian glows
                    float glow1 = exp(-d1 * d1 * 5.0);
                    float glow2 = exp(-d2 * d2 * 3.8);
                    float glow3 = exp(-d3 * d3 * 2.8);

                    // AI Colors: Cyan, Deep Purple, and Indigo Blue
                    vec3 colorCyan = vec3(0.0, 0.90, 1.0);
                    vec3 colorPurple = vec3(0.66, 0.33, 0.97);
                    vec3 colorIndigo = vec3(0.08, 0.24, 0.78);

                    // Accumulate glow colors
                    vec3 finalColor = glow1 * colorCyan + glow2 * colorPurple + glow3 * colorIndigo;

                    // Layer 1: Subtle multi-scale volumetric background fog
                    float fogNoise = snoise(vec3(uv * 3.2, uTime * 0.012));
                    finalColor += vec3(fogNoise * 0.015);

                    // Dampen the total output to maintain dark cinematic background & high UI readability
                    finalColor *= 0.16;
                    
                    // Add very low dark ambient indigo base
                    finalColor += vec3(0.012, 0.008, 0.022);

                    // Film Grain Overlay (organic cinematic texture)
                    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
                    finalColor += (grain - 0.5) * 0.012;

                    // Vignette to darken edges
                    vec2 dV = gl_FragCoord.xy / uResolution.xy - vec2(0.5);
                    float vignette = 1.0 - dot(dV, dV) * 1.5;
                    vignette = clamp(vignette, 0.0, 1.0);
                    finalColor *= pow(vignette, 1.4);

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            depthWrite: false,
            depthTest: false,
            transparent: true
        });

        // Background quad covering viewport
        const bgGeometry = new THREE.PlaneGeometry(1, 1);
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        bgMesh.position.set(0, 0, -95);
        camera.add(bgMesh);
        scene.add(camera);

        // ==========================================
        // LAYER 3: SPARSE PARTICLE FIELD
        // ==========================================
        const count = 220;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const opacities = new Float32Array(count);
        const seeds = new Float32Array(count * 3);

        const colorCyan = new THREE.Color(0x22d3ee);
        const colorViolet = new THREE.Color(0xa855f7);
        const colorWhite = new THREE.Color(0xe2e8f0);

        velocities.current = [];

        for (let i = 0; i < count; i++) {
            // Distribute in a wide 3D box
            positions[i * 3] = (Math.random() - 0.5) * 95;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 55;
            positions[i * 3 + 2] = -Math.random() * 50 - 5; // Z between -55 and -5

            // Slow initial velocities
            velocities.current.push({
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005,
                z: (Math.random() - 0.5) * 0.002
            });

            // Random seeds for frequency and direction of drift
            seeds[i * 3] = Math.random() * 1.8 + 0.2;
            seeds[i * 3 + 1] = Math.random() * 1.8 + 0.2;
            seeds[i * 3 + 2] = Math.random() * 1.8 + 0.2;

            // Sizes (scaled by shader size attenuation)
            sizes[i] = 1.2 + Math.random() * 3.8;

            // Opacities
            opacities[i] = 0.1 + Math.random() * 0.65;

            // Select color from UI theme palette
            const r = Math.random();
            let col = colorWhite;
            if (r < 0.42) col = colorCyan;
            else if (r < 0.82) col = colorViolet;

            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('customOpacity', new THREE.BufferAttribute(opacities, 1));

        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uOpacityMultiplier: { value: 0.88 }
            },
            vertexShader: `
                attribute float size;
                attribute float customOpacity;
                varying vec3 vColor;
                varying float vOpacity;

                void main() {
                    vColor = color;
                    vOpacity = customOpacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    // Size attenuation: closer particles appear larger
                    gl_PointSize = size * (280.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float uOpacityMultiplier;
                varying vec3 vColor;
                varying float vOpacity;

                void main() {
                    // Procedural radial soft glowing circle
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float glow = smoothstep(0.5, 0.05, dist);
                    glow = pow(glow, 1.8);
                    
                    gl_FragColor = vec4(vColor, glow * vOpacity * uOpacityMultiplier);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });

        const particles = new THREE.Points(geometry, particleMaterial);
        scene.add(particles);

        let frameId;
        const animate = () => {
            frameId = requestAnimationFrame(animate);

            const time = clock.getElapsedTime();
            const posAttr = geometry.attributes.position;
            const posArray = posAttr.array;
            const opacityAttr = geometry.attributes.customOpacity;
            const opacityArray = opacityAttr.array;

            // Eased/Delayed mouse interaction (inertia/viscosity)
            const k = 0.024;
            smoothedMouse.current.x += (mousePos.current.x - smoothedMouse.current.x) * k;
            smoothedMouse.current.y += (mousePos.current.y - smoothedMouse.current.y) * k;
            smoothedMouse.current.rawX += (mousePos.current.rawX - smoothedMouse.current.rawX) * k;
            smoothedMouse.current.rawY += (mousePos.current.rawY - smoothedMouse.current.rawY) * k;

            // Update background shader uniform
            bgMaterial.uniforms.uTime.value = time;
            bgMaterial.uniforms.uMouse.value.set(smoothedMouse.current.rawX, smoothedMouse.current.rawY);

            const mx = smoothedMouse.current.x;
            const my = smoothedMouse.current.y;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                let x = posArray[i3];
                let y = posArray[i3 + 1];
                let z = posArray[i3 + 2];

                const vel = velocities.current[i];
                const sx = seeds[i3];
                const sy = seeds[i3 + 1];
                const sz = seeds[i3 + 2];

                // 1. Organic slow drift (sine field)
                const driftX = Math.sin(time * 0.16 * sx + i) * 0.0008;
                const driftY = Math.cos(time * 0.14 * sy + i) * 0.0008;
                const driftZ = Math.sin(time * 0.08 * sz + i) * 0.0004;

                vel.x += driftX;
                vel.y += driftY;
                vel.z += driftZ;

                // 2. Viscous interaction with the smoothed mouse attractor/repeller
                const dx = x - mx;
                const dy = y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 24) {
                    // Soft repeller pushing particles away with circular viscosity
                    const force = (1.0 - dist / 24) * 0.0028;
                    const swirlX = -dy * force * 0.35;
                    const swirlY = dx * force * 0.35;
                    vel.x += dx * force + swirlX;
                    vel.y += dy * force + swirlY;
                }

                // Apply damping (viscosity)
                vel.x *= 0.976;
                vel.y *= 0.976;
                vel.z *= 0.976;

                // Update position
                x += vel.x;
                y += vel.y;
                z += vel.z;

                // Keep particles inside bounding box
                if (x > 50) { x = -50; vel.x *= 0.5; }
                else if (x < -50) { x = 50; vel.x *= 0.5; }

                if (y > 32) { y = -32; vel.y *= 0.5; }
                else if (y < -32) { y = 32; vel.y *= 0.5; }

                if (z > -2) { z = -55; vel.z *= 0.5; }
                else if (z < -55) { z = -2; vel.z *= 0.5; }

                posArray[i3] = x;
                posArray[i3 + 1] = y;
                posArray[i3 + 2] = z;

                // Breathing opacity modulation
                opacityArray[i] = 0.1 + 0.65 * Math.sin(time * 0.22 * sx + i);
            }

            posAttr.needsUpdate = true;
            opacityAttr.needsUpdate = true;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

            bgMaterial.uniforms.uResolution.value.set(width, height);

            const fovRad = (camera.fov * Math.PI) / 180;
            const planeHeight = 2 * 95 * Math.tan(fovRad / 2);
            const planeWidth = planeHeight * camera.aspect;
            bgMesh.scale.set(planeWidth, planeHeight, 1);
        };
        window.addEventListener('resize', handleResize);
        
        // Initial setup for the background plane scale
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            if (renderer.domElement && mountEl.contains(renderer.domElement)) {
                mountEl.removeChild(renderer.domElement);
            }
            bgGeometry.dispose();
            bgMaterial.dispose();
            geometry.dispose();
            particleMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#040208]">
            <div ref={mountRef} className="absolute inset-0" />
            <div className="background-vignette" />
        </div>
    );
};

export default ThreeBackground;
