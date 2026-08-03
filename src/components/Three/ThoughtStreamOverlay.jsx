import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { quotesData } from '../../data/quotes';

const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(`${currentLine} ${word}`).width;
    if (width < maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

const drawWord = (ctx, text, x, y, alpha, colors, fontSize, colorType) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `500 ${fontSize}px "Fira Code", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rgb = colorType === 'primary' ? colors.primaryRgb : colors.secondaryRgb;
  ctx.shadowColor = `rgba(${rgb}, 0.55)`;
  ctx.shadowBlur = 4;
  ctx.fillStyle = `rgba(${rgb}, 0.95)`;
  ctx.fillText(text, x, y);
  ctx.restore();
};

const drawQuote = (ctx, lines, author, x, y, colors, alpha) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const quoteLineHeight = 15;
  const authorLineHeight = 14;
  const blockHeight = lines.length * quoteLineHeight + authorLineHeight;
  let lineY = y - blockHeight / 2 + quoteLineHeight / 2;

  ctx.font = 'bold 11px "Space Grotesk", sans-serif';
  ctx.shadowColor = `rgba(${colors.primaryRgb}, 0.55)`;
  ctx.shadowBlur = 10;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  lines.forEach((line) => {
    ctx.fillText(line, x, lineY);
    lineY += quoteLineHeight;
  });

  ctx.shadowColor = `rgba(${colors.secondaryRgb}, 0.5)`;
  ctx.shadowBlur = 8;
  ctx.fillStyle = `rgba(${colors.secondaryRgb}, 0.95)`;
  ctx.font = '9px "Fira Code", monospace';
  ctx.fillText(`— ${author}`, x, lineY + 2);
  ctx.restore();
};

const themeToColors = (theme) => {
  switch (theme) {
    case 'solar':
      return { primaryRgb: '242, 153, 74', secondaryRgb: '235, 87, 87' };
    case 'emerald':
      return { primaryRgb: '34, 197, 94', secondaryRgb: '15, 118, 110' };
    case 'void':
      return { primaryRgb: '209, 213, 219', secondaryRgb: '107, 114, 128' };
    case 'cyber':
    default:
      return { primaryRgb: '34, 211, 238', secondaryRgb: '168, 85, 247' };
  }
};

/**
 * Floating ambient words + quotes overlay (shared by 3D and video avatars).
 * Call ref.triggerQuote() from parent click handlers.
 */
const ThoughtStreamOverlay = forwardRef(function ThoughtStreamOverlay(
  { theme = 'cyber', language = 'en', enabled = true },
  ref
) {
  const canvasRef = useRef(null);
  const triggerQuoteRef = useRef(null);
  const lastQuoteIndexRef = useRef(-1);
  const themeColors = useMemo(() => themeToColors(theme), [theme]);

  useImperativeHandle(ref, () => ({
    triggerQuote: () => {
      if (triggerQuoteRef.current) triggerQuoteRef.current();
    },
  }));

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let lastSpawnTime = 0;
    let lastQuoteSpawnTime = performance.now();
    let particles = [];

    const ambientWords = quotesData[language]?.ambientWords || [];
    const quotes = quotesData[language]?.quotes || [];

    const spawnParticle = (text, type = 'word', customVel = null) => {
      const isQuote = type === 'quote';
      const lifeSpan = isQuote ? 7000 : 3000 + Math.random() * 1500;

      const p = {
        type,
        text: isQuote ? text.quote : text,
        author: isQuote ? text.author : null,
        x: 180 + (isQuote ? 0 : (Math.random() - 0.5) * 30),
        y: 230 + (isQuote ? 0 : (Math.random() - 0.5) * 15),
        vx: customVel ? customVel.x : (isQuote ? 0 : (Math.random() - 0.5) * 0.4),
        vy: customVel ? customVel.y : (isQuote ? -0.4 : -0.8 - Math.random() * 0.6),
        seed: Math.random() * 100,
        driftAmp: isQuote ? 0 : 8 + Math.random() * 12,
        driftFreq: isQuote ? 0 : 0.0015 + Math.random() * 0.0015,
        fontSize: isQuote ? 11 : 9 + Math.floor(Math.random() * 4),
        colorType: Math.random() > 0.45 ? 'primary' : 'secondary',
        maxAlpha: isQuote ? 0.95 : 0.45 + Math.random() * 0.25,
        createdAt: performance.now(),
        lifeSpan,
      };

      if (isQuote) {
        particles = particles.filter((pt) => pt.type !== 'quote');
      }
      particles.push(p);
    };

    triggerQuoteRef.current = () => {
      if (quotes.length === 0) return;

      let index = Math.floor(Math.random() * quotes.length);
      if (quotes.length > 1 && index === lastQuoteIndexRef.current) {
        index = (index + 1) % quotes.length;
      }
      lastQuoteIndexRef.current = index;
      spawnParticle(quotes[index], 'quote');

      if (ambientWords.length > 0) {
        for (let i = 0; i < 5; i++) {
          const word = ambientWords[Math.floor(Math.random() * ambientWords.length)];
          const angle = ((Math.PI * 2) / 5) * i + (Math.random() - 0.5) * 0.3;
          const speed = 0.8 + Math.random() * 0.5;
          spawnParticle(word, 'word', {
            x: Math.cos(angle) * speed,
            y: -1.0 - Math.random() * 0.4,
          });
        }
      }
      lastQuoteSpawnTime = performance.now();
    };

    let isVisible = false;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 24;

    const animate = (time) => {
      if (!isVisible) return;
      animationId = requestAnimationFrame(animate);

      if (time) {
        const elapsed = time - lastFrameTime;
        if (elapsed < frameInterval) return;
        lastFrameTime = time - (elapsed % frameInterval);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (time - lastSpawnTime > 1500) {
        if (ambientWords.length > 0) {
          const word = ambientWords[Math.floor(Math.random() * ambientWords.length)];
          spawnParticle(word, 'word');
        }
        lastSpawnTime = time;
      }

      if (time - lastQuoteSpawnTime > 12000 && triggerQuoteRef.current) {
        triggerQuoteRef.current();
      }

      particles = particles.filter((p) => {
        const elapsed = time - p.createdAt;
        const progress = elapsed / p.lifeSpan;
        if (progress >= 1.0) return false;

        let currentX = p.x + p.vx * (elapsed / 16);
        let currentY = p.y + p.vy * (elapsed / 16);
        if (p.type === 'word') {
          currentX += Math.sin(time * p.driftFreq + p.seed) * p.driftAmp * 0.05;
        }

        let alpha = p.maxAlpha;
        if (p.type === 'quote') {
          if (progress < 0.15) alpha = (progress / 0.15) * p.maxAlpha;
          else if (progress > 0.7) alpha = ((1.0 - progress) / 0.3) * p.maxAlpha;
        } else if (progress < 0.2) {
          alpha = (progress / 0.2) * p.maxAlpha;
        } else if (progress > 0.6) {
          alpha = ((1.0 - progress) / 0.4) * p.maxAlpha;
        }
        alpha = Math.max(0, Math.min(alpha, 1.0));

        if (p.type === 'quote') {
          ctx.font = 'bold 11px "Space Grotesk", sans-serif';
          const lines = wrapText(ctx, p.text, 220);
          drawQuote(ctx, lines, p.author, currentX, currentY, themeColors, alpha);
        } else {
          drawWord(ctx, p.text, currentX, currentY, alpha, themeColors, p.fontSize, p.colorType);
        }
        return true;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          cancelAnimationFrame(animationId);
          lastQuoteSpawnTime = performance.now();
          lastSpawnTime = performance.now();
          lastFrameTime = performance.now();
          particles = [];
          animate(lastFrameTime);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      triggerQuoteRef.current = null;
    };
  }, [language, themeColors, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-30"
      style={{ width: '360px', height: '420px' }}
      width={360}
      height={420}
      aria-hidden="true"
    />
  );
});

export default ThoughtStreamOverlay;
