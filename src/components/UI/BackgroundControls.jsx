import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import AudioService from '../../services/AudioService';
import { translations } from '../../data/translations';

const BackgroundControls = ({
    bgConfig,
    setBgConfig,
    bgMode = 'video',
    setBgMode,
    setShowSynth,
    themeMode = 'manual',
    setThemeMode,
    cycleProgress = 0,
    language = 'en'
}) => {
    const t = translations[language]?.controls || translations.en.controls;
    const [isOpen, setIsOpen] = useState(false);
    const [audioMode, setAudioMode] = useState(AudioService.mode);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const handleModeChange = (e) => {
            setAudioMode(e.detail);
        };
        window.addEventListener('audioModeChanged', handleModeChange);
        return () => window.removeEventListener('audioModeChanged', handleModeChange);
    }, []);

    useEffect(() => {
        if (themeMode !== 'chrono') return;
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [themeMode]);

    // Escape + lock body scroll while open (mobile)
    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', onKey);

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen]);

    const handleAudioModeChange = (modeId) => {
        AudioService.setMode(modeId);
    };

    const audioModes = [
        { id: 'silent', label: t.audioModes.silent.label, icon: 'volume-x', desc: t.audioModes.silent.desc },
        { id: 'ui', label: t.audioModes.ui.label, icon: 'sliders', desc: t.audioModes.ui.desc },
        { id: 'immersive', label: t.audioModes.immersive.label, icon: 'waves', desc: t.audioModes.immersive.desc }
    ];

    const qualityProfiles = [
        { id: 'high', label: t.quality.high.label, desc: t.quality.high.desc },
        { id: 'balanced', label: t.quality.balanced.label, desc: t.quality.balanced.desc },
        { id: 'eco', label: t.quality.eco.label, desc: t.quality.eco.desc },
        { id: 'static', label: t.quality.static.label, desc: t.quality.static.desc }
    ];

    const themes = [
        { id: 'cyber', label: 'Cyber', colors: ['#22d3ee', '#a855f7'], desc: 'Cyan + Purple' },
        { id: 'solar', label: 'Solar', colors: ['#f2994a', '#eb5757'], desc: 'Gold + Red' },
        { id: 'emerald', label: 'Emerald', colors: ['#22c55e', '#0f766e'], desc: 'Green + Teal' },
        { id: 'void', label: 'Void', colors: ['#d1d5db', '#374151'], desc: 'Silver + Slate' }
    ];

    const handleThemeChange = (themeId) => {
        setBgConfig(prev => ({ ...prev, theme: themeId }));
        if (setBgMode) {
            setBgMode(themeId === 'cyber' ? 'video' : 'shader');
        }
        if (setThemeMode) {
            setThemeMode('manual');
        }
    };

    const handleSliderChange = (name, value) => {
        setBgConfig(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleQualityChange = (qualityId) => {
        setBgConfig(prev => ({ ...prev, quality: qualityId }));
    };

    const getChronoIcon = () => {
        const hours = currentTime.getHours();
        return hours >= 6 && hours < 18 ? 'sun' : 'moon';
    };

    const close = () => setIsOpen(false);

    return (
        <>
            {/* Floating open button — raised on mobile so browser chrome / home bar never covers it */}
            {!isOpen && (
                <div className="fixed z-40 font-mono left-4 bottom-20 md:left-8 md:bottom-8">
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="flex items-center justify-center w-12 h-12 rounded-full glass-panel border border-white/10 text-cyber-cyan hover:text-white hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.3)] transition-all duration-300 hover:scale-105 cursor-pointer"
                        title={t.title}
                        aria-label={t.title}
                    >
                        <Icon name="sliders" size={20} className="animate-pulse" />
                    </button>
                </div>
            )}

            {isOpen && (
                <>
                    {/* Dim backdrop — tap outside to close (especially mobile) */}
                    <button
                        type="button"
                        aria-label="Close settings"
                        className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] cursor-default border-0 p-0"
                        onClick={close}
                    />

                    {/*
                      Mobile: inset bottom sheet (side + bottom margins), not edge-to-edge.
                      Desktop: bottom-left card.
                    */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ambient-engine-title"
                        className="fixed z-50 font-mono left-3 right-3 bottom-3 md:left-8 md:right-auto md:bottom-8 md:w-80 flex flex-col max-h-[min(78dvh,640px)] md:max-h-[min(85dvh,640px)] rounded-2xl glass-panel border border-white/10 shadow-2xl animate-fadeIn overflow-hidden"
                        style={{
                            marginBottom: 'env(safe-area-inset-bottom, 0px)',
                        }}
                    >
                        {/* Sticky header — always on screen */}
                        <div className="flex-shrink-0 flex justify-between items-center gap-3 px-4 pt-3 pb-3 md:px-5 border-b border-white/10 bg-black/40 backdrop-blur-md">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse shrink-0" />
                                <h4
                                    id="ambient-engine-title"
                                    className="text-xs font-black text-white uppercase tracking-widest font-cyber truncate"
                                >
                                    {t.title}
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                className="shrink-0 flex items-center justify-center w-10 h-10 -mr-1 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-cyber-cyan/40 hover:bg-white/5 transition-colors cursor-pointer"
                                aria-label="Close"
                            >
                                <Icon name="x" size={18} />
                            </button>
                        </div>

                        {/* Scrollable body — extra bottom padding so Patch Console is easy to tap above home bar */}
                        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-4 pb-8 md:px-5 md:pb-6 touch-pan-y">
                            {/* Diagnostics */}
                            <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-500 mb-4 bg-black/30 p-2 rounded border border-white/5">
                                <div>{t.engine}: <span className="text-green-400 font-bold">{t.ready}</span></div>
                                <div>{t.palette}: <span className="text-cyber-cyan uppercase">{bgConfig.theme}</span></div>
                                <div>{t.mode}: <span className="text-cyber-purple uppercase">{themeMode}</span></div>
                                <div>{t.load}: <span className="text-white">{t.nominal}</span></div>
                            </div>

                            {/* Background type */}
                            <div className="mb-4">
                                <span className="block text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-display">{t.bgType}</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {[
                                        { id: 'shader', label: t.bgShader, desc: t.bgShaderDesc },
                                        { id: 'video', label: t.bgVideo, desc: t.bgVideoDesc },
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setBgMode && setBgMode(m.id)}
                                            className={`py-2 px-2 rounded text-center border text-[10px] transition-all duration-300 flex flex-col items-center justify-center font-display font-medium gap-1 cursor-pointer ${
                                                bgMode === m.id
                                                    ? 'border-cyber-cyan bg-cyber-cyan/10 text-white shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.15)]'
                                                    : 'border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                            title={m.desc}
                                        >
                                            <span className="uppercase tracking-wider text-[9px] font-mono">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Theme System Mode */}
                            <div className="mb-4">
                                <span className="block text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-display">{t.sysMode}</span>
                                <div className="grid grid-cols-3 gap-1.5 font-sans">
                                    {[
                                        { id: 'manual', label: t.manualLock, icon: 'lock', desc: t.manualLockDesc },
                                        { id: 'chrono', label: t.chronoSync, icon: 'clock', desc: t.chronoSyncDesc },
                                        { id: 'cycle', label: t.matrixCycle, icon: 'refresh-cw', desc: t.matrixCycleDesc }
                                    ].map(m => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setThemeMode && setThemeMode(m.id)}
                                            className={`py-1.5 px-1 rounded text-center border text-[9px] transition-all duration-300 flex flex-col items-center justify-center font-display font-medium gap-1 cursor-pointer ${
                                                themeMode === m.id
                                                    ? 'border-cyber-cyan bg-cyber-cyan/10 text-white shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.15)]'
                                                    : 'border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                            title={m.desc}
                                        >
                                            <Icon name={m.icon} size={14} className={themeMode === m.id ? 'text-cyber-cyan' : 'text-neutral-400'} />
                                            <span className="uppercase tracking-wider text-[7px] font-mono leading-none">{m.label.split(' ')[0]}</span>
                                            <span className="uppercase tracking-wider text-[6px] opacity-60 font-mono leading-none">{m.label.split(' ')[1]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {themeMode === 'chrono' && (
                                <div className="mb-4 bg-black/40 p-2.5 rounded border border-white/5 animate-fadeIn flex items-center justify-between text-xs font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <Icon
                                            name={getChronoIcon()}
                                            size={14}
                                            className="text-amber-400 animate-pulse"
                                        />
                                        <span className="text-[9px] text-gray-400 uppercase tracking-wider">{t.chronoStatus}</span>
                                    </div>
                                    <span className="text-cyber-cyan font-bold font-cyber tracking-widest">
                                        {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                            )}

                            {themeMode === 'cycle' && (
                                <div className="mb-4 bg-black/40 p-2.5 rounded border border-white/5 animate-fadeIn">
                                    <div className="flex justify-between text-[8px] text-gray-400 font-mono mb-1.5">
                                        <span>{t.nextCycle}</span>
                                        <span className="text-cyber-cyan font-bold">{Math.round(45 * (1 - cycleProgress / 100))}s</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-purple transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(var(--primary-color-rgb),0.5)]"
                                            style={{ width: `${cycleProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <span className="block text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-display">{t.matrixPalette}</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {themes.map(tTheme => (
                                        <button
                                            key={tTheme.id}
                                            type="button"
                                            onClick={() => handleThemeChange(tTheme.id)}
                                            className={`p-2 rounded text-left border text-xs transition-all duration-300 flex items-center justify-between font-display font-medium cursor-pointer ${
                                                bgConfig.theme === tTheme.id
                                                    ? 'border-cyber-cyan bg-cyber-cyan/10 text-white shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.1)]'
                                                    : 'border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            <span>{tTheme.label}</span>
                                            <div className="flex gap-0.5">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tTheme.colors[0] }} />
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tTheme.colors[1] }} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <span className="block text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-display">{t.audioMatrix}</span>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {audioModes.map(m => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => handleAudioModeChange(m.id)}
                                            className={`py-1.5 px-1 rounded text-center border text-[10px] transition-all duration-300 flex flex-col items-center justify-center font-display font-medium gap-0.5 cursor-pointer ${
                                                audioMode === m.id
                                                    ? 'border-cyber-cyan bg-cyber-cyan/10 text-white shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.15)]'
                                                    : 'border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                            title={m.desc}
                                        >
                                            <Icon name={m.icon} size={16} className={audioMode === m.id ? 'text-cyber-cyan' : 'text-neutral-400'} />
                                            <span className="uppercase tracking-wider text-[8px] font-mono">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <span className="block text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-display">{t.perfProfile}</span>
                                <div className="grid grid-cols-4 gap-1">
                                    {qualityProfiles.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => handleQualityChange(p.id)}
                                            className={`py-1.5 px-0.5 rounded text-center border text-[9px] transition-all duration-300 flex flex-col items-center justify-center font-display font-medium gap-0.5 cursor-pointer ${
                                                bgConfig.quality === p.id
                                                    ? 'border-cyber-cyan bg-cyber-cyan/10 text-white shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.15)]'
                                                    : 'border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                            title={p.desc}
                                        >
                                            <span className="uppercase tracking-wider text-[8px] font-mono leading-none">{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-1 font-display font-medium">
                                        <span>{t.brightness}</span>
                                        <span className="text-cyber-cyan font-cyber font-bold">{bgConfig.brightness.toFixed(1)}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.2"
                                        max="2.0"
                                        step="0.1"
                                        value={bgConfig.brightness}
                                        onChange={(e) => handleSliderChange('brightness', e.target.value)}
                                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-1 font-display font-medium">
                                        <span>{t.driftVelocity}</span>
                                        <span className="text-cyber-cyan font-cyber font-bold">{bgConfig.speed.toFixed(1)}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.0"
                                        max="2.5"
                                        step="0.1"
                                        value={bgConfig.speed}
                                        onChange={(e) => handleSliderChange('speed', e.target.value)}
                                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowSynth(prev => !prev);
                                    close();
                                }}
                                className="w-full mt-4 mb-6 py-2.5 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/10 hover:border-cyber-cyan/50 text-white hover:text-cyber-cyan text-xs font-cyber font-bold tracking-widest uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.15)]"
                            >
                                <Icon name="sliders" size={14} className="animate-pulse" />
                                <span>{t.patchConsole}</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default BackgroundControls;
