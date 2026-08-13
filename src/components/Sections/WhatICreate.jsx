import React, { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../UI/Icon';
import AudioService from '../../services/AudioService';
import { translations } from '../../data/translations';

const iconsList = ["sparkles", "code", "terminal", "sliders", "headphones", "file-code"];

const WhatICreate = ({ language = 'en' }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(3);
    const dragStart = useRef({ x: 0, y: 0 });

    const t = translations[language].create;

    // Handle responsiveness
    useEffect(() => {
        const updateCardsToShow = () => {
            if (window.innerWidth >= 1024) {
                setCardsToShow(3);
            } else if (window.innerWidth >= 768) {
                setCardsToShow(2);
            } else {
                setCardsToShow(1);
            }
        };

        updateCardsToShow();
        window.addEventListener('resize', updateCardsToShow);
        return () => window.removeEventListener('resize', updateCardsToShow);
    }, []);

    const maxIndex = useMemo(() => {
        const len = t.items ? t.items.length : 0;
        return Math.max(0, len - cardsToShow);
    }, [t.items, cardsToShow]);

    const safeCurrentIndex = Math.min(currentIndex, maxIndex);

    const handleMouseEnter = (idx) => {
        if (window.matchMedia('(hover: hover)').matches) {
            setHoveredIdx(idx);
            AudioService.playTick();
        }
    };

    const handleMouseLeave = () => {
        if (window.matchMedia('(hover: hover)').matches) {
            setHoveredIdx(null);
        }
    };

    const handleClick = (idx) => {
        setHoveredIdx((prev) => (prev === idx ? null : idx));
        AudioService.playTick();
    };

    const handlePrev = () => {
        AudioService.playTick();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        AudioService.playTick();
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    };

    const handlePointerDown = (e) => {
        dragStart.current = {
            x: e.clientX,
            y: e.clientY
        };
    };

    const handlePointerUp = (e) => {
        if (!dragStart.current) return;
        const diffX = e.clientX - dragStart.current.x;
        const diffY = e.clientY - dragStart.current.y;

        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                handlePrev();
            } else {
                handleNext();
            }
        }
    };

    const showCarouselControls = maxIndex > 0;

    return (
        <section id="create" className="py-24 px-6 glass-panel border-y border-white/5 relative z-10 bg-[#07050a]/40">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-16 reveal">
                    <div className="h-px bg-cyber-cyan w-12"></div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest font-cyber cyber-glitch" data-text={t.heading.toUpperCase()}>
                        {t.heading}
                    </h2>
                    <div className="h-px bg-white/10 flex-grow"></div>
                </div>

                {/* Carousel Viewport Container */}
                <div className="relative w-full reveal reveal-scale">
                    <div 
                        className="overflow-hidden w-full px-1 py-4"
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        style={{ touchAction: 'pan-y' }}
                    >
                        <div 
                            className={`flex transition-transform duration-500 ease-out font-display ${!showCarouselControls ? 'justify-center mx-auto' : ''}`}
                            style={{ 
                                transform: showCarouselControls 
                                    ? `translateX(-${safeCurrentIndex * (100 / t.items.length)}%)` 
                                    : 'none',
                                width: showCarouselControls 
                                    ? `${(t.items.length / cardsToShow) * 100}%` 
                                    : 'auto'
                            }}
                        >
                            {t.items.map((cap, idx) => {
                                const isHovered = hoveredIdx === idx;
                                const iconName = iconsList[idx] || "code";
                                const cardWidth = showCarouselControls 
                                    ? `${100 / t.items.length}%` 
                                    : 'auto';
                                return (
                                    <div 
                                        key={idx} 
                                        className="px-3 flex flex-col min-w-0"
                                        style={{ 
                                            width: cardWidth,
                                            maxWidth: !showCarouselControls && cardsToShow === 3 ? 'calc(33.333% - 1.5rem)' : !showCarouselControls && cardsToShow === 2 ? 'calc(50% - 1.5rem)' : '100%'
                                        }}
                                    >
                                        <div
                                            onMouseEnter={() => handleMouseEnter(idx)}
                                            onMouseLeave={handleMouseLeave}
                                            onClick={() => handleClick(idx)}
                                            className="group relative bg-[#0a080f]/90 border border-white/10 hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] rounded-xl p-6 transition-all duration-300 flex flex-col justify-between h-[360px] tech-corners corners-cyan select-none cursor-pointer"
                                        >
                                            <div>
                                                {/* Icon & Title */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="p-3 bg-white/5 rounded-lg text-cyber-cyan group-hover:bg-cyber-cyan group-hover:text-black transition-all duration-300">
                                                        <Icon name={iconName} size={22} />
                                                    </div>
                                                    <div className="text-[9px] font-mono text-zinc-600 tracking-wider">
                                                        {t.sysCap}_0{idx + 1}
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-black text-white mb-3 group-hover:text-cyber-cyan transition-colors font-cyber tracking-wider">
                                                    {cap.title}
                                                </h3>
                                                <p className="text-zinc-400 text-sm font-sans leading-relaxed">
                                                    {cap.description}
                                                </p>
                                            </div>

                                            {/* Animated Tech Terminal on Hover */}
                                            <div className="mt-4 font-mono text-[9px] bg-black/50 border border-white/5 rounded p-2.5 text-zinc-500 overflow-hidden relative h-20 flex flex-col justify-end">
                                                <div className="absolute top-1.5 left-2 text-[8px] uppercase tracking-widest text-zinc-600 border-b border-white/5 pb-1 w-[calc(100%-1rem)]">
                                                    {t.liveTelemetry}
                                                </div>
                                                <div className="space-y-0.5 mt-4 transition-all duration-300">
                                                    {cap.log.map((line, lIdx) => (
                                                        <div
                                                            key={lIdx}
                                                            className={`transition-opacity duration-300 ${
                                                                isHovered 
                                                                    ? 'opacity-100 translate-y-0' 
                                                                    : lIdx === cap.log.length - 1 
                                                                        ? 'opacity-30' 
                                                                        : 'opacity-0 translate-y-2'
                                                            }`}
                                                            style={{ 
                                                                transitionDelay: isHovered ? `${lIdx * 100}ms` : '0ms',
                                                                color: lIdx === cap.log.length - 1 && isHovered ? '#22d3ee' : '#6b7280'
                                                            }}
                                                        >
                                                            {line}
                                                        </div>
                                                    ))}
                                                </div>
                                                {!isHovered && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] hover:backdrop-blur-none transition-all">
                                                        <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 border border-zinc-700/30 px-2.5 py-1 rounded bg-[#0a080f]/80 animate-pulse">
                                                            {t.hoverToAnalyze}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {showCarouselControls && (
                        <>
                            <button
                                onClick={handlePrev}
                                disabled={safeCurrentIndex === 0}
                                className="absolute -left-2 md:-left-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-cyber-cyan/20 bg-cyber-dark/80 text-cyber-cyan hover:border-cyber-cyan hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.4)] disabled:opacity-25 disabled:pointer-events-none transition-all duration-300 backdrop-blur-md cursor-pointer hidden md:flex items-center justify-center"
                                aria-label="Previous slide"
                            >
                                <Icon name="chevron-left" size={20} />
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={safeCurrentIndex === maxIndex}
                                className="absolute -right-2 md:-right-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-cyber-cyan/20 bg-cyber-dark/80 text-cyber-cyan hover:border-cyber-cyan hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.4)] disabled:opacity-25 disabled:pointer-events-none transition-all duration-300 backdrop-blur-md cursor-pointer hidden md:flex items-center justify-center"
                                aria-label="Next slide"
                            >
                                <Icon name="chevron-right" size={20} />
                            </button>
                        </>
                    )}

                    {/* Dot Indicators */}
                    {showCarouselControls && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        AudioService.playTick();
                                        setCurrentIndex(idx);
                                    }}
                                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                        safeCurrentIndex === idx 
                                            ? 'w-6 bg-cyber-cyan shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.5)]' 
                                            : 'w-2 bg-white/20 hover:bg-white/40'
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default WhatICreate;

