import React, { useState } from 'react';
import Icon from '../UI/Icon';
import AudioService from '../../services/AudioService';
import { translations } from '../../data/translations';

const iconsList = ["sparkles", "code", "terminal", "sliders", "headphones", "file-code"];

const WhatICreate = ({ language = 'en' }) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const t = translations[language].create;

    const handleMouseEnter = (idx) => {
        setHoveredIdx(idx);
        AudioService.playTick();
    };

    const handleMouseLeave = () => {
        setHoveredIdx(null);
    };

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

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-display">
                    {t.items.map((cap, idx) => {
                        const isHovered = hoveredIdx === idx;
                        const iconName = iconsList[idx] || "code";
                        return (
                            <div
                                key={idx}
                                onMouseEnter={() => handleMouseEnter(idx)}
                                onMouseLeave={handleMouseLeave}
                                className="group relative bg-[#0a080f]/90 border border-white/10 hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] rounded-xl p-6 transition-all duration-300 flex flex-col justify-between h-[360px] tech-corners corners-cyan select-none"
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
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhatICreate;
