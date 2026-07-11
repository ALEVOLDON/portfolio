import React, { useEffect, useRef } from 'react';

class Particle {
    constructor(p, hueBase) {
        this.p = p;
        this.pos = p.createVector(p.random(p.width), p.random(p.height));
        this.vel = p.createVector(p.random(-1, 1), p.random(-1, 1));
        this.acc = p.createVector(0, 0);
        this.maxSpeed = p.random(0.5, 1.5);
        this.colorHue = hueBase + p.random(-20, 20);
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
        this.p.fill(this.colorHue, 200, 255, 150);
        this.p.ellipse(this.pos.x, this.pos.y, 3, 3);
    }

    checkEdges() {
        if (this.pos.x > this.p.width) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = this.p.width;
        if (this.pos.y > this.p.height) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = this.p.height;
    }
}

const GenerativeThumbnail = ({ seedStr }) => {
    const sketchRef = useRef(null);
    const p5Instance = useRef(null);

    useEffect(() => {
        let cancelled = false;
        let observer = null;

        const createSketch = () => (p) => {
            let particles = [];
            let hueBase;
            const numParticles = 36; // Multiple cards can be visible at once
            let frameCount = 0;

            p.setup = () => {
                // Determine base color mapping from the seed string
                let hash = 0;
                for (let i = 0; i < seedStr.length; i++) {
                    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
                }
                p.randomSeed(hash);
                p.noiseSeed(hash);

                // Canvas size matching the card header aspect ratio
                p.createCanvas(sketchRef.current.offsetWidth, sketchRef.current.offsetHeight);
                p.colorMode(p.HSB, 255);

                // Map the hash to a cyber-ish hue (cyan/purple range is around 180 to 220)
                hueBase = p.map(Math.abs(hash) % 100, 0, 100, 160, 240);

                // Initialize random particles
                for (let i = 0; i < numParticles; i++) {
                    particles.push(new Particle(p, hueBase));
                }
            };

            p.draw = () => {
                frameCount += 1;
                // Clear background with semi-transparent dark shade for trail effect
                p.background(10, 10, 10, 50);

                particles.forEach(particle => {
                    particle.update();
                    particle.display();
                    particle.checkEdges();
                });

                // Connect particles with lines if they are close
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        let d = p.dist(particles[i].pos.x, particles[i].pos.y, particles[j].pos.x, particles[j].pos.y);
                        if (d < 50) {
                            let alpha = p.map(d, 0, 50, 255, 0);
                            p.stroke(particles[i].colorHue, 200, 255, alpha);
                            p.strokeWeight(1);
                            p.line(particles[i].pos.x, particles[i].pos.y, particles[j].pos.x, particles[j].pos.y);
                        }
                    }
                }

                if (frameCount > 180) {
                    p.noLoop();
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
    }, [seedStr]);

    return (
        <div
            ref={sketchRef}
            className="w-full h-full absolute inset-0 bg-cyber-dark"
            style={{ overflow: 'hidden' }}
        />
    );
};

export default GenerativeThumbnail;
