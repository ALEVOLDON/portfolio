Да, абсолютно реально — и даже лучше, чем видео.

Такую подложку (flowing plasma streams + floating orbs + fractal noise + digital rain) идеально рисуют кодом на WebGL / Three.js / GLSL-шейдере.
У тебя на сайте уже есть ThreeBackground — это как раз тот же подход. Видео — это «костыль», а шейдер даёт:

идеальный infinite loop
0 КБ лишнего трафика (только код)
GPU-ускорение
можно менять цвета, скорость, плотность на лету (под твои темы cyber / solar / emerald / void)
parallax / mouse-reactive
Вот готовый рабочий вариант (Three.js + custom shader)
Можешь просто вставить как компонент (или адаптировать под свой ThreeBackground):

// PlasmaBackground.tsx
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function PlasmaBackground({ 
  speed = 0.4, 
  intensity = 1.0,
  theme = 'cyber' // 'cyber' | 'solar' | 'emerald' | 'void'
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Цвета под твои темы
    const colors = {
      cyber:   { c1: new THREE.Color('#22d3ee'), c2: new THREE.Color('#a855f7') },
      solar:   { c1: new THREE.Color('#f2994a'), c2: new THREE.Color('#eb5757') },
      emerald: { c1: new THREE.Color('#22c55e'), c2: new THREE.Color('#0f766e') },
      void:    { c1: new THREE.Color('#d1d5db'), c2: new THREE.Color('#6b7280') },
    };
    const { c1, c2 } = colors[theme] || colors.cyber;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uSpeed: { value: speed },
        uIntensity: { value: intensity },
        uColor1: { value: c1 },
        uColor2: { value: c2 },
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
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;

        // Simplex-like noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
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
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        float fbm(vec3 p) {
          float f = 0.0;
          f += 0.5000 * snoise(p); p *= 2.02;
          f += 0.2500 * snoise(p); p *= 2.03;
          f += 0.1250 * snoise(p); p *= 2.01;
          f += 0.0625 * snoise(p);
          return f;
        }

        void main() {
          vec2 uv = vUv;
          vec2 p = (uv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
          
          float t = uTime * uSpeed;

          // Plasma streams
          float plasma = fbm(vec3(p * 1.5 + vec2(t * 0.15, t * 0.08), t * 0.1));
          plasma += 0.5 * fbm(vec3(p * 3.0 - vec2(t * 0.2, -t * 0.12), t * 0.15));
          
          // Digital rain / vertical streaks
          float rain = 0.0;
          for(int i = 0; i < 8; i++) {
            float fi = float(i);
            vec2 rp = p * vec2(20.0 + fi * 3.0, 8.0) + vec2(fi * 13.7, -t * (1.2 + fi * 0.3));
            rain += smoothstep(0.95, 1.0, fract(rp.y)) * (0.15 / (1.0 + fi * 0.4));
          }

          // Floating orbs (soft glows)
          float orbs = 0.0;
          for(int i = 0; i < 6; i++) {
            float fi = float(i);
            vec2 op = vec2(
              sin(t * 0.3 + fi * 1.7) * 0.7 + cos(t * 0.17 + fi) * 0.3,
              cos(t * 0.25 + fi * 2.1) * 0.5 + sin(t * 0.19 + fi * 0.8) * 0.4
            );
            float d = length(p - op);
            orbs += 0.08 / (d * d * 18.0 + 0.3) * (0.6 + 0.4 * sin(t * 2.0 + fi));
          }

          // Final composition
          vec3 col = vec3(0.0);
          col += uColor1 * (plasma * 0.55 + rain * 0.7) * uIntensity;
          col += uColor2 * (plasma * 0.4 + orbs) * uIntensity;
          col += vec3(0.02, 0.03, 0.06) * (1.0 + plasma * 0.3); // deep base

          // Soft vignette
          float vig = 1.0 - smoothstep(0.6, 1.4, length(p * 0.7));
          col *= vig;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      material.uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      material.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [speed, intensity, theme]);

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }} 
    />
  );
}
Как использовать
// В layout или hero
<PlasmaBackground speed={0.35} intensity={0.9} theme="cyber" />