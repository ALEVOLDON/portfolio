import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * WebGL plasma background inspired by flowing streams + orbs + fractal noise + digital rain.
 * Props match App bgConfig: brightness, speed, theme, quality.
 */
const PlasmaBackground = ({
  brightness = 1.0,
  speed = 1.0,
  theme = 'cyber',
  quality = 'high',
}) => {
  const mountRef = useRef(null);
  const configRef = useRef({ brightness, speed, theme, quality });
  const materialRef = useRef(null);
  const colorsRef = useRef({
    c1: new THREE.Color(0x22d3ee),
    c2: new THREE.Color(0xa855f7),
    bg: new THREE.Color(0x030106),
  });
  const targetsRef = useRef({
    c1: new THREE.Color(0x22d3ee),
    c2: new THREE.Color(0xa855f7),
    bg: new THREE.Color(0x030106),
  });

  useEffect(() => {
    configRef.current = { brightness, speed, theme, quality };
  }, [brightness, speed, theme, quality]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountEl = mountRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x030106, 1);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mountEl.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uSpeed: { value: 1 },
        uIntensity: { value: 1 },
        uQuality: { value: 2 },
        uReducedMotion: { value: prefersReducedMotion ? 1.0 : 0.0 },
        uColor1: { value: colorsRef.current.c1.clone() },
        uColor2: { value: colorsRef.current.c2.clone() },
        uBg: { value: colorsRef.current.bg.clone() },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uSpeed;
        uniform float uIntensity;
        uniform int uQuality;
        uniform float uReducedMotion;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uBg;
        varying vec2 vUv;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
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
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        float fbm(vec3 p) {
          float f = 0.0;
          f += 0.5000 * snoise(p); p *= 2.02;
          f += 0.2500 * snoise(p); p *= 2.03;
          f += 0.1250 * snoise(p); p *= 2.01;
          f += 0.0625 * snoise(p);
          return f;
        }

        float fbmLite(vec3 p) {
          float f = 0.0;
          f += 0.55 * snoise(p); p *= 2.1;
          f += 0.30 * snoise(p); p *= 2.0;
          f += 0.15 * snoise(p);
          return f;
        }

        void main() {
          vec2 uv = vUv;
          float aspect = uResolution.x / max(uResolution.y, 1.0);
          vec2 p = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);

          // Keep a floor of motion even if reduced-motion is on (still calm, not frozen)
          float motion = mix(1.0, 0.35, uReducedMotion);
          float t = uTime * uSpeed * motion;

          // Flowing plasma / wispy streams — time coeffs high enough to see continuous drift
          float plasma = 0.0;
          if (uQuality >= 2) {
            plasma = fbm(vec3(p * 1.35 + vec2(t * 0.55, t * 0.32), t * 0.4));
            plasma += 0.55 * fbm(vec3(p * 2.6 - vec2(t * 0.7, -t * 0.45), t * 0.55));
            plasma += 0.25 * fbm(vec3(p.yx * 3.4 + vec2(-t * 0.4, t * 0.65), t * 0.35));
          } else if (uQuality == 1) {
            plasma = fbmLite(vec3(p * 1.4 + vec2(t * 0.55, t * 0.32), t * 0.4));
            plasma += 0.45 * fbmLite(vec3(p * 2.4 - vec2(t * 0.65, -t * 0.4), t * 0.5));
          } else {
            plasma = fbmLite(vec3(p * 1.3 + vec2(t * 0.45, t * 0.28), t * 0.35));
          }

          // Ridge / filament look — brighter along stream cores
          float filaments = smoothstep(0.05, 0.75, plasma);
          filaments = pow(max(filaments, 0.0), 1.25);

          // Digital rain (vertical code streaks)
          float rain = 0.0;
          int rainCount = uQuality >= 2 ? 10 : (uQuality == 1 ? 6 : 3);
          for (int i = 0; i < 10; i++) {
            if (i >= rainCount) break;
            float fi = float(i);
            vec2 rp = p * vec2(18.0 + fi * 2.8, 7.5) + vec2(fi * 17.3, -t * (2.4 + fi * 0.55));
            float streak = smoothstep(0.92, 1.0, fract(rp.y)) * smoothstep(0.08, 0.0, abs(fract(rp.x) - 0.5));
            rain += streak * (0.18 / (1.0 + fi * 0.35));
          }

          // Floating orbs / soft bokeh glows
          float orbs = 0.0;
          int orbCount = uQuality >= 2 ? 8 : (uQuality == 1 ? 5 : 3);
          for (int i = 0; i < 8; i++) {
            if (i >= orbCount) break;
            float fi = float(i);
            vec2 op = vec2(
              sin(t * 0.55 + fi * 1.7) * 0.75 + cos(t * 0.32 + fi * 0.9) * 0.35,
              cos(t * 0.48 + fi * 2.1) * 0.55 + sin(t * 0.38 + fi * 0.7) * 0.35
            );
            float d = length(p - op);
            float pulse = 0.55 + 0.45 * sin(t * 2.4 + fi * 1.3);
            orbs += (0.07 / (d * d * 22.0 + 0.25)) * pulse;
            // Tiny hard core
            orbs += 0.012 * smoothstep(0.06, 0.0, d) * pulse;
          }

          // Soft fractal dust
          float dust = 0.0;
          if (uQuality >= 1) {
            dust = max(0.0, fbmLite(vec3(p * 6.0, t * 0.25)) - 0.35) * 0.35;
          }

          // Compose toward reference: cyan streams + purple bloom + rain
          vec3 col = uBg;
          col += uColor1 * (filaments * 1.05 + rain * 1.0 + dust * 0.5) * uIntensity;
          col += uColor2 * (filaments * 0.65 + orbs * 1.35 + plasma * 0.35) * uIntensity;
          // Hot core highlight along bright filaments
          col += vec3(0.65, 0.9, 1.0) * pow(max(filaments, 0.0), 3.2) * 0.55 * uIntensity;

          // Soft vignette
          float vig = 1.0 - smoothstep(0.55, 1.55, length(p * vec2(0.65, 0.85)));
          col *= mix(0.55, 1.0, vig);

          // Keep deep blacks
          col = max(col, uBg * 0.85);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });

    materialRef.current = material;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let frameId = 0;
    let lastFrameTime = 0;
    let visible = document.visibilityState === 'visible';
    let staticPainted = false;
    let timeAccumulator = 0;

    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const q = configRef.current.quality;
      let maxDpr = 1.5;
      if (q === 'balanced') maxDpr = 1.15;
      if (q === 'eco' || q === 'static') maxDpr = 1;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      // updateStyle=true so canvas CSS size matches viewport (critical for full-bleed bg)
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, true);
      material.uniforms.uResolution.value.set(w * dpr, h * dpr);
    };

    const themeTargets = (name) => {
      const t = targetsRef.current;
      switch (name) {
        case 'solar':
          t.c1.set(0xf2994a);
          t.c2.set(0xeb5757);
          t.bg.set(0x080302);
          break;
        case 'emerald':
          t.c1.set(0x22c55e);
          t.c2.set(0x0f766e);
          t.bg.set(0x020604);
          break;
        case 'void':
          t.c1.set(0xd1d5db);
          t.c2.set(0x6b7280);
          t.bg.set(0x0a0c10);
          break;
        case 'cyber':
        default:
          t.c1.set(0x22d3ee);
          t.c2.set(0xa855f7);
          t.bg.set(0x030106);
          break;
      }
    };

    const paintFrame = (advanceTime) => {
      const q = configRef.current.quality;
      themeTargets(configRef.current.theme);
      const cur = colorsRef.current;
      const tgt = targetsRef.current;
      const lerp = 0.05;
      cur.c1.lerp(tgt.c1, lerp);
      cur.c2.lerp(tgt.c2, lerp);
      cur.bg.lerp(tgt.bg, lerp);

      material.uniforms.uColor1.value.copy(cur.c1);
      material.uniforms.uColor2.value.copy(cur.c2);
      material.uniforms.uBg.value.copy(cur.bg);
      renderer.setClearColor(cur.bg, 1);

      if (advanceTime) {
        const delta = clock.getDelta();
        // Manual accumulator so speed changes apply smoothly and time never stalls
        timeAccumulator += delta * Math.max(0.15, configRef.current.speed);
      }

      material.uniforms.uTime.value = timeAccumulator;
      // Base flow speed — high enough that streams/orbs clearly move
      material.uniforms.uSpeed.value = 0.85;
      material.uniforms.uIntensity.value = 1.15 * configRef.current.brightness;

      let qualityVal = 2;
      if (q === 'balanced') qualityVal = 1;
      if (q === 'eco' || q === 'static') qualityVal = 0;
      material.uniforms.uQuality.value = qualityVal;

      renderer.render(scene, camera);
    };

    const animate = (timestamp = 0) => {
      frameId = requestAnimationFrame(animate);
      if (!visible) return;

      const q = configRef.current.quality;

      // Static quality: paint once, then hold (still paint the first frame)
      if (q === 'static') {
        if (!staticPainted) {
          paintFrame(false);
          staticPainted = true;
        }
        return;
      }
      staticPainted = false;

      let fpsInterval = 1000 / 30;
      if (q === 'high') fpsInterval = 1000 / 45;
      if (q === 'eco') fpsInterval = 1000 / 20;
      if (prefersReducedMotion) fpsInterval = 1000 / 18;

      if (timestamp) {
        const elapsed = timestamp - lastFrameTime;
        if (elapsed < fpsInterval) return;
        lastFrameTime = timestamp - (elapsed % fpsInterval);
      }

      paintFrame(true);
    };

    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
      if (visible) {
        clock.getDelta(); // drop stalled delta after tab hide
        lastFrameTime = performance.now();
      }
    };

    window.addEventListener('resize', setSize);
    document.addEventListener('visibilitychange', onVisibility);
    setSize();
    // Immediate first paint so bg isn't empty before rAF
    paintFrame(false);
    animate(performance.now());

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', setSize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (renderer.domElement && mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      materialRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-cyber-black">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="background-vignette" />
    </div>
  );
};

export default PlasmaBackground;
