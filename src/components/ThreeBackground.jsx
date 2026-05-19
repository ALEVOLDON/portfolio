import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const isSmallViewport = () => window.innerWidth < 768 || window.innerHeight < 620;

const ThreeBackground = () => {
    const mountRef = useRef(null);
    const pointer = useRef({ x: 0, y: 0 });
    const easedPointer = useRef({ x: 0, y: 0 });
    const pointerVelocity = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handlePointerMove = (event) => {
            pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, []);

    useEffect(() => {
        if (!mountRef.current) return;

        const mountEl = mountRef.current;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const backgroundScene = new THREE.Scene();
        const particleScene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const clock = new THREE.Clock();

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance'
        });
        renderer.setClearColor(0x030106, 1);
        mountEl.appendChild(renderer.domElement);

        const backgroundMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(1, 1) },
                uPointer: { value: new THREE.Vector2(0, 0) },
                uReducedMotion: { value: prefersReducedMotion ? 1 : 0 }
            },
            vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = position.xy * 0.5 + 0.5;
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;

                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec2 uPointer;
                uniform int uReducedMotion;
                varying vec2 vUv;

                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);

                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);

                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;

                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;

                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);

                    vec4 x = x_ * ns.x + ns.yyyy;
                    vec4 y = y_ * ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);

                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);

                    vec4 s0 = floor(b0) * 2.0 + 1.0;
                    vec4 s1 = floor(b1) * 2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));

                    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);

                    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;

                    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
                }

                float fbm(vec3 p) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    for (int i = 0; i < 4; i++) {
                        value += amplitude * snoise(p);
                        p = p * 2.03 + vec3(11.7, 4.2, 8.1);
                        amplitude *= 0.5;
                    }
                    return value;
                }

                void main() {
                    vec2 centered = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
                    float time = uReducedMotion == 1 ? 0.0 : uTime;

                    vec2 pointerField = uPointer * vec2(0.16, 0.10);
                    vec2 slowDrift = vec2(
                        fbm(vec3(centered * 0.65 + pointerField, time * 0.025)),
                        fbm(vec3(centered * 0.72 - pointerField.yx, time * 0.022 + 8.0))
                    );

                    vec2 warped = centered + slowDrift * 0.22;
                    float nebulaA = fbm(vec3(warped * 1.25 + vec2(-0.18, 0.12), time * 0.035));
                    float nebulaB = fbm(vec3(warped * 1.85 + vec2(2.8, -1.4), time * -0.028));
                    float veil = fbm(vec3(warped * 3.4 + slowDrift * 0.55, time * 0.018 + 4.0));

                    float field = smoothstep(-0.25, 0.72, nebulaA * 0.72 + nebulaB * 0.38);
                    float filament = pow(smoothstep(0.08, 0.78, abs(veil)), 2.5);
                    float verticalDepth = smoothstep(-0.9, 0.65, centered.y + nebulaB * 0.22);

                    vec3 deepInk = vec3(0.010, 0.006, 0.019);
                    vec3 midnight = vec3(0.020, 0.014, 0.045);
                    vec3 cyan = vec3(0.04, 0.78, 0.94);
                    vec3 violet = vec3(0.55, 0.25, 0.95);
                    vec3 blue = vec3(0.05, 0.18, 0.62);

                    vec3 color = mix(deepInk, midnight, verticalDepth);
                    color += cyan * field * 0.18;
                    color += violet * smoothstep(0.22, 1.0, nebulaB + 0.45) * 0.16;
                    color += blue * filament * 0.12;

                    float softBloom = pow(max(field + filament * 0.42, 0.0), 3.2);
                    color += mix(cyan, violet, smoothstep(-0.3, 0.6, nebulaB)) * softBloom * 0.08;

                    float heroDarkZone = 1.0 - smoothstep(0.0, 0.46, length(centered * vec2(0.82, 1.18)));
                    color *= 1.0 - heroDarkZone * 0.48;

                    float vignette = smoothstep(1.14, 0.24, length(centered * vec2(0.78, 1.0)));
                    color *= 0.35 + vignette * 0.74;

                    float grain = fract(sin(dot(gl_FragCoord.xy + time * 18.0, vec2(12.9898, 78.233))) * 43758.5453);
                    color += (grain - 0.5) * 0.010;

                    gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
                }
            `,
            depthTest: false,
            depthWrite: false
        });

        const background = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backgroundMaterial);
        backgroundScene.add(background);

        const particleCount = prefersReducedMotion ? 0 : (isSmallViewport() ? 70 : 130);
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const basePositions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const seeds = new Float32Array(particleCount * 4);

        const colorA = new THREE.Color(0x48e8ff);
        const colorB = new THREE.Color(0xa855f7);
        const colorC = new THREE.Color(0xd8f8ff);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const z = -10 - Math.random() * 55;
            const depthScale = 1 + Math.abs(z) / 45;

            positions[i3] = (Math.random() - 0.5) * 72 * depthScale;
            positions[i3 + 1] = (Math.random() - 0.5) * 44 * depthScale;
            positions[i3 + 2] = z;

            basePositions[i3] = positions[i3];
            basePositions[i3 + 1] = positions[i3 + 1];
            basePositions[i3 + 2] = z;

            const color = Math.random() < 0.52 ? colorA : Math.random() < 0.82 ? colorB : colorC;
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = 0.65 + Math.random() * 2.3;
            seeds[i * 4] = Math.random() * 100;
            seeds[i * 4 + 1] = 0.04 + Math.random() * 0.14;
            seeds[i * 4 + 2] = 0.18 + Math.random() * 0.82;
            seeds[i * 4 + 3] = Math.random() * Math.PI * 2;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        particleGeometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));

        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uPixelRatio: { value: 1 },
                uBaseOpacity: { value: isSmallViewport() ? 0.30 : 0.42 }
            },
            vertexShader: `
                attribute float size;
                attribute vec4 seed;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vColor = color;
                    vAlpha = seed.z;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float depth = clamp(180.0 / -mvPosition.z, 1.0, 10.0);
                    gl_PointSize = size * depth;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                precision highp float;

                uniform float uBaseOpacity;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec2 p = gl_PointCoord - 0.5;
                    float d = length(p);
                    if (d > 0.5) discard;
                    float core = smoothstep(0.5, 0.02, d);
                    float haze = smoothstep(0.5, 0.18, d) * 0.35;
                    float alpha = clamp((core * 0.72 + haze) * vAlpha * uBaseOpacity, 0.0, 0.55);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });

        const particleCamera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
        particleCamera.position.z = 18;
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particleScene.add(particles);

        let frameId = 0;
        let visible = true;

        const setRendererSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const pixelRatio = Math.min(window.devicePixelRatio || 1, isSmallViewport() ? 1 : 1.35);

            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(width, height);
            backgroundMaterial.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
            particleMaterial.uniforms.uBaseOpacity.value = isSmallViewport() ? 0.30 : 0.42;

            particleCamera.aspect = width / height;
            particleCamera.updateProjectionMatrix();
        };

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (!visible) return;

            const time = clock.getElapsedTime();
            const easing = 0.035;
            const lastX = easedPointer.current.x;
            const lastY = easedPointer.current.y;

            easedPointer.current.x += (pointer.current.x - easedPointer.current.x) * easing;
            easedPointer.current.y += (pointer.current.y - easedPointer.current.y) * easing;
            pointerVelocity.current.x = easedPointer.current.x - lastX;
            pointerVelocity.current.y = easedPointer.current.y - lastY;

            backgroundMaterial.uniforms.uTime.value = time;
            backgroundMaterial.uniforms.uPointer.value.set(easedPointer.current.x, easedPointer.current.y);

            if (particleCount > 0) {
                const positionAttr = particleGeometry.attributes.position;
                const positionArray = positionAttr.array;

                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    const i4 = i * 4;
                    const seed = seeds[i4];
                    const speed = seeds[i4 + 1];
                    const phase = seeds[i4 + 3];
                    const depth = Math.abs(basePositions[i3 + 2]) / 55;
                    const parallax = (1.15 - depth) * 2.4;

                    const flowX = Math.sin(time * speed + seed + phase) * (0.55 + depth);
                    const flowY = Math.cos(time * speed * 0.84 + seed * 1.7) * (0.42 + depth * 0.6);
                    const viscousX = easedPointer.current.x * parallax + pointerVelocity.current.x * 46 * (1.0 - depth);
                    const viscousY = easedPointer.current.y * parallax + pointerVelocity.current.y * 32 * (1.0 - depth);

                    positionArray[i3] = basePositions[i3] + flowX + viscousX;
                    positionArray[i3 + 1] = basePositions[i3 + 1] + flowY + viscousY;
                    positionArray[i3 + 2] = basePositions[i3 + 2];
                }

                positionAttr.needsUpdate = true;
            }

            renderer.autoClear = true;
            renderer.render(backgroundScene, camera);
            renderer.autoClear = false;
            renderer.render(particleScene, particleCamera);
        };

        const handleVisibilityChange = () => {
            visible = document.visibilityState === 'visible';
            if (visible) clock.getDelta();
        };

        window.addEventListener('resize', setRendererSize);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        setRendererSize();
        animate();

        return () => {
            window.removeEventListener('resize', setRendererSize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            cancelAnimationFrame(frameId);

            if (renderer.domElement && mountEl.contains(renderer.domElement)) {
                mountEl.removeChild(renderer.domElement);
            }

            background.geometry.dispose();
            backgroundMaterial.dispose();
            particleGeometry.dispose();
            particleMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#030106]">
            <div ref={mountRef} className="absolute inset-0" />
            <div className="background-vignette" />
        </div>
    );
};

export default ThreeBackground;
