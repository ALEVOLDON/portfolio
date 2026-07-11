import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import AudioService from '../../services/AudioService';

const BackgroundControls = ({ 
    bgConfig, 
    setBgConfig, 
    setShowSynth,
    themeMode = 'manual',
    setThemeMode,
    cycleProgress = 0
}) => {
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

    // Live-clock for Chrono Sync status display
    useEffect(() => {
        if (themeMode !== 'chrono') return;
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [themeMode]);

    const handleAudioModeChange = (modeId) => {
        AudioService.setMode(modeId);
    };

    const audioModes = [
        { id: 'silent', label: 'Silent', icon: 'volume-x', desc: 'Mute all sounds' },
        { id: 'ui', label: 'UI FX', icon: 'sliders', desc: 'Hover & click feedback' },
        { id: 'immersive', label: 'Ambient', icon: 'waves', desc: 'Full drone & spatial audio' }
    ];

    const qualityProfiles = [
        { id: 'high', label: 'High', desc: 'High quality, 1.15x resolution scale, 60 FPS cap' },
        { id: 'balanced', label: 'Bal', desc: 'Balanced, 1.0x resolution scale, 45 FPS cap' },
        { id: 'eco', label: 'Eco', desc: 'Eco friendly, 0.75x resolution scale, 24 FPS cap' },
        { id: 'static', label: 'Static', desc: 'Render background once, freeze animations, 0% GPU load' }
    ];

    const themes = [
        { id: 'cyber', label: 'Cyber', colors: ['#22d3ee', '#a855f7'], desc: 'Cyan + Purple' },
        { id: 'solar', label: 'Solar', colors: ['#f2994a', '#eb5757'], desc: 'Gold + Red' },
        { id: 'emerald', label: 'Emerald', colors: ['#22c55e', '#0f766e'], desc: 'Green + Teal' },
        { id: 'void', label: 'Void', colors: ['#d1d5db', '#374151'], desc: 'Silver + Slate' }
    ];

    const handleThemeChange = (themeId) => {
        setBgConfig(prev => ({ ...prev, theme: themeId }));
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

    // Helper to get sun/moon icon for Chrono sync
    const getChronoIcon = () => {
        const hours = currentTime.getHours();
        return hours >= 6 && hours < 18 ? 'sun' : 'moon';
    };

    return (
        <div className="fixed bottom-8 left-8 z-40 font-mono">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-12 h-12 rounded-full glass-panel border border-white/10 text-cyber-cyan hover:text-white hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.3)] transition-all duration-300 hover:scale-105 cursor-pointer"
                    title="Configure Background Engine"
                >
                    <Icon name="sliders" size={20} className="animate-pulse" />
                </button>
            )}

            {/* Config Panel */}
            {isOpen && (
                <div className="w-80 p-5 rounded-xl glass-panel border border-white/10 shadow-2xl relative animate-fadeIn">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse"></span>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest font-cyber">AMBIENT ENGINE</h4>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                        >
                            <Icon name="x" size={16} />
                        </button>
                    </div>

                    {/* Diagnostics (Sci-fi decoration) */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-500 mb-4 bg-black/30 p-2 rounded border border-white/5">
                        <div>ENGINE: <span className="text-green-400 font-bold">READY</span></div>
                        <div>PALETTE: <span className="text-cyber-cyan uppercase">{bgConfig.theme}</span></div>
                        <div>MODE: <span className="text-cyber-purple uppercase">{themeMode}</span></div>
                        <div>LOAD: <span className="text-white">NOMINAL</span></div>
                    </div>

                    {/* Theme System Mode */}
                    <div className="mb-4">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-display">SYSTEM OPER. MODE</span>
                        <div className="grid grid-cols-3 gap-1.5 font-sans">
                            {[
                                { id: 'manual', label: 'Manual Lock', icon: 'lock', desc: 'Fix theme to selected palette' },
                                { id: 'chrono', label: 'Chrono Sync', icon: 'clock', desc: 'Sync theme with local hour' },
                                { id: 'cycle', label: 'Matrix Cycle', icon: 'refresh-cw', desc: 'Cycle themes automatically' }
                            ].map(m => (
                                <button
                                    key={m.id}
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

                    {/* Chrono status panel */}
                    {themeMode === 'chrono' && (
                        <div className="mb-4 bg-black/40 p-2.5 rounded border border-white/5 animate-fadeIn flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-1.5">
                                <Icon 
                                    name={getChronoIcon()} 
                                    size={14} 
                                    className="text-amber-400 animate-pulse" 
                                />
                                <span className="text-[9px] text-gray-400 uppercase tracking-wider">CHRONO STATUS</span>
                            </div>
                            <span className="text-cyber-cyan font-bold font-cyber tracking-widest">
                                {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    )}

                    {/* Cycle progress panel */}
                    {themeMode === 'cycle' && (
                        <div className="mb-4 bg-black/40 p-2.5 rounded border border-white/5 animate-fadeIn">
                            <div className="flex justify-between text-[8px] text-gray-400 font-mono mb-1.5">
                                <span>NEXT DRIFT CYCLE</span>
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

                    {/* Theme Selectors */}
                    <div className="mb-4">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-display">MATRIX PALETTE</span>
                        <div className="grid grid-cols-2 gap-2">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleThemeChange(t.id)}
                                    className={`p-2 rounded text-left border text-xs transition-all duration-300 flex items-center justify-between font-display font-medium cursor-pointer ${
                                        bgConfig.theme === t.id
                                            ? 'border-cyber-cyan bg-cyber-cyan/10 text-white shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.1)]'
                                            : 'border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white'
                                    }`}
                                >
                                    <span>{t.label}</span>
                                    <div className="flex gap-0.5">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.colors[0] }} />
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.colors[1] }} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audio Matrix */}
                    <div className="mb-4">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-display">AUDIO MATRIX</span>
                        <div className="grid grid-cols-3 gap-1.5">
                            {audioModes.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => handleAudioModeChange(m.id)}
                                    className={`py-1.5 px-1 rounded text-center border text-[10px] transition-all duration-300 flex flex-col items-center justify-center font-display font-medium gap-0.5 cursor-pointer ${
                                        audioMode === m.id
                                            ? 'border-cyber-cyan bg-cyber-cyan/10 text-white shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.15)]'
                                            : 'border-white/10 bg-transparent text-gray-400 hover:border-white/20 hover:text-white'
                                    }`}
                                    title={m.desc}
                                >
                                    <Icon name={m.icon} size={16} className={audioMode === m.id ? 'text-cyber-cyan' : 'text-neutral-400 group-hover:text-white'} />
                                    <span className="uppercase tracking-wider text-[8px] font-mono">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Performance Profile */}
                    <div className="mb-4">
                        <span className="block text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-display">PERFORMANCE PROFILE</span>
                        <div className="grid grid-cols-4 gap-1">
                            {qualityProfiles.map(p => (
                                <button
                                    key={p.id}
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

                    {/* Sliders */}
                    <div className="space-y-4">
                        {/* Brightness */}
                        <div>
                             <div className="flex justify-between text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-1 font-display font-medium">
                                <span>BRIGHTNESS</span>
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

                        {/* Speed */}
                        <div>
                             <div className="flex justify-between text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-1 font-display font-medium">
                                <span>DRIFT VELOCITY</span>
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

                    {/* Modular Console Toggle Button */}
                    <button
                        onClick={() => {
                            setShowSynth(prev => !prev);
                            setIsOpen(false); // Close drawer to keep screen tidy
                        }}
                        className="w-full mt-4 py-2 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/10 hover:border-cyber-cyan/50 text-white hover:text-cyber-cyan text-xs font-cyber font-bold tracking-widest uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.15)]"
                    >
                        <Icon name="sliders" size={14} className="animate-pulse" />
                        <span>Patch Console</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default BackgroundControls;
