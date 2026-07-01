import React, { useEffect, useRef } from 'react';

const hashString = (value) => {
    let hash = 2166136261;
    const text = String(value || '');

    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
};

const createRandom = (seed) => {
    let state = seed || 1;
    return () => {
        state = Math.imul(1664525, state) + 1013904223;
        return (state >>> 0) / 4294967296;
    };
};

const GenerativeThumbnail = ({ seedStr }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return undefined;

        const seed = hashString(seedStr);
        const random = createRandom(seed);
        const hueBase = 180 + (seed % 70);
        const particles = [];
        const particleCount = 32;
        let animationFrameId = 0;
        let frameCount = 0;
        let isVisible = false;
        let observer;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
            const width = Math.max(1, Math.floor(rect.width * pixelRatio));
            const height = Math.max(1, Math.floor(rect.height * pixelRatio));

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
        };

        resize();

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: random(),
                y: random(),
                vx: (random() - 0.5) * 0.0028,
                vy: (random() - 0.5) * 0.0028,
                hue: hueBase + (random() - 0.5) * 34,
                size: 1.8 + random() * 2.2
            });
        }

        const draw = () => {
            if (!isVisible) return;
            animationFrameId = requestAnimationFrame(draw);
            frameCount += 1;

            const width = canvas.width;
            const height = canvas.height;
            ctx.fillStyle = 'rgb(10, 10, 10)';
            ctx.fillRect(0, 0, width, height);

            const gradient = ctx.createRadialGradient(
                width * 0.5,
                height * 0.45,
                0,
                width * 0.5,
                height * 0.45,
                Math.max(width, height) * 0.72
            );
            gradient.addColorStop(0, `hsla(${hueBase}, 85%, 18%, 0.55)`);
            gradient.addColorStop(1, 'rgba(7, 7, 12, 1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            particles.forEach((particle) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > 1) particle.vx *= -1;
                if (particle.y < 0 || particle.y > 1) particle.vy *= -1;
                particle.x = Math.max(0, Math.min(1, particle.x));
                particle.y = Math.max(0, Math.min(1, particle.y));
            });

            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                const ax = a.x * width;
                const ay = a.y * height;

                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const bx = b.x * width;
                    const by = b.y * height;
                    const dx = ax - bx;
                    const dy = ay - by;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const threshold = Math.min(width, height) * 0.22;

                    if (distance < threshold) {
                        const alpha = (1 - distance / threshold) * 0.36;
                        ctx.strokeStyle = `hsla(${a.hue}, 95%, 62%, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(ax, ay);
                        ctx.lineTo(bx, by);
                        ctx.stroke();
                    }
                }
            }

            particles.forEach((particle) => {
                ctx.fillStyle = `hsla(${particle.hue}, 95%, 62%, 0.78)`;
                ctx.beginPath();
                ctx.arc(particle.x * width, particle.y * height, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });

            if (frameCount > 150) {
                cancelAnimationFrame(animationFrameId);
            }
        };

        observer = new IntersectionObserver((entries) => {
            const wasVisible = isVisible;
            isVisible = entries.some((entry) => entry.isIntersecting);

            if (isVisible && !wasVisible) {
                resize();
                cancelAnimationFrame(animationFrameId);
                draw();
            } else if (!isVisible) {
                cancelAnimationFrame(animationFrameId);
            }
        }, { rootMargin: '250px 0px' });

        observer.observe(canvas);
        window.addEventListener('resize', resize);

        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [seedStr]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full absolute inset-0 bg-cyber-dark"
            aria-hidden="true"
        />
    );
};

export default GenerativeThumbnail;
