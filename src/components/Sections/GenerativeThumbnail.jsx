import React, { useEffect, useRef } from 'react';

class Particle {
    constructor(p, hueBase, sat = 200) {
        this.p = p;
        this.pos = p.createVector(p.random(p.width), p.random(p.height));
        this.vel = p.createVector(p.random(-1, 1), p.random(-1, 1));
        this.acc = p.createVector(0, 0);
        this.maxSpeed = p.random(0.5, 1.5);
        this.colorHue = hueBase + p.random(-15, 15);
        this.sat = sat;
    }

    update() {
        const angle = this.p.noise(this.pos.x * 0.01, this.pos.y * 0.01, this.p.frameCount * 0.005) * this.p.TWO_PI * 4;
        const force = this.p.createVector(Math.cos(angle), Math.sin(angle));
        force.setMag(0.1);

        this.acc.add(force);
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    display() {
        this.p.noStroke();
        this.p.fill(this.colorHue, this.sat, 255, 150);
        this.p.ellipse(this.pos.x, this.pos.y, 3, 3);
    }

    checkEdges() {
        if (this.pos.x > this.p.width) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = this.p.width;
        if (this.pos.y > this.p.height) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = this.p.height;
    }
}

const getThemeHueAndSat = (themeName, hash, p) => {
    switch (themeName) {
        case 'solar':
            return {
                hue: p.map(Math.abs(hash) % 100, 0, 100, 10, 45),
                sat: 220
            };
        case 'emerald':
            return {
                hue: p.map(Math.abs(hash) % 100, 0, 100, 75, 120),
                sat: 210
            };
        case 'void':
            return {
                hue: p.map(Math.abs(hash) % 100, 0, 100, 140, 160),
                sat: 40
            };
        case 'cyber':
        default:
            return {
                hue: p.map(Math.abs(hash) % 100, 0, 100, 160, 230),
                sat: 200
            };
    }
};

const GenerativeThumbnail = ({ seedStr, theme = 'cyber' }) => {
    const sketchRef = useRef(null);
    const p5Instance = useRef(null);

    useEffect(() => {
        let cancelled = false;
        let observer = null;

        const createSketch = () => (p) => {
            let particles = [];
            const numParticles = 36;
            p.setup = () => {
                let hash = 0;
                for (let i = 0; i < seedStr.length; i++) {
                    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
                }
                p.randomSeed(hash);
                p.noiseSeed(hash);

                p.createCanvas(sketchRef.current.offsetWidth, sketchRef.current.offsetHeight);
                p.colorMode(p.HSB, 255);

                const { hue: hueBase, sat } = getThemeHueAndSat(theme, hash, p);

                for (let i = 0; i < numParticles; i++) {
                    particles.push(new Particle(p, hueBase, sat));
                }
            };

            p.draw = () => {
                p.background(10, 10, 10, 50);

                particles.forEach(particle => {
                    particle.update();
                    particle.display();
                    particle.checkEdges();
                });

                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        let d = p.dist(particles[i].pos.x, particles[i].pos.y, particles[j].pos.x, particles[j].pos.y);
                        if (d < 50) {
                            let alpha = p.map(d, 0, 50, 255, 0);
                            p.stroke(particles[i].colorHue, particles[i].sat, 255, alpha);
                            p.strokeWeight(1);
                            p.line(particles[i].pos.x, particles[i].pos.y, particles[j].pos.x, particles[j].pos.y);
                        }
                    }
                }
            };

            p.windowResized = () => {
                if (sketchRef.current) {
                    p.resizeCanvas(sketchRef.current.offsetWidth, sketchRef.current.offsetHeight);
                }
            };

        };

        const startSketch = () => {
            if (!sketchRef.current || p5Instance.current) return;

            import('p5').then(({ default: p5 }) => {
                if (cancelled || !sketchRef.current) return;
                p5Instance.current = new p5(createSketch(), sketchRef.current);
            });
        };

        if (sketchRef.current) {
            observer = new IntersectionObserver((entries) => {
                const isVisible = entries.some((entry) => entry.isIntersecting);
                if (isVisible) {
                    startSketch();
                    p5Instance.current?.loop();
                } else {
                    p5Instance.current?.noLoop();
                }
            }, { rootMargin: '250px 0px' });

            observer.observe(sketchRef.current);
        }

        return () => {
            cancelled = true;
            observer?.disconnect();
            if (p5Instance.current) {
                p5Instance.current.remove();
                p5Instance.current = null;
            }
        };
    }, [seedStr, theme]);

    return (
        <div
            ref={sketchRef}
            className="w-full h-full absolute inset-0 bg-cyber-dark"
            style={{ overflow: 'hidden' }}
        />
    );
};

export default GenerativeThumbnail;
