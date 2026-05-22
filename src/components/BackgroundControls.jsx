import React, { useState } from 'react';
import Icon from './Icon';

const BackgroundControls = ({ bgConfig, setBgConfig }) => {
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'cyber', label: 'Cyber', colors: ['#22d3ee', '#a855f7'], desc: 'Cyan + Purple' },
        { id: 'solar', label: 'Solar', colors: ['#f2994a', '#eb5757'], desc: 'Gold + Red' },
        { id: 'emerald', label: 'Emerald', colors: ['#22c55e', '#0f766e'], desc: 'Green + Teal' },
        { id: 'void', label: 'Void', colors: ['#d1d5db', '#374151'], desc: 'Silver + Slate' }
    ];

    const handleThemeChange = (themeId) => {
        setBgConfig(prev => ({ ...prev, theme: themeId }));
    };

    const handleSliderChange = (name, value) => {
        setBgConfig(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    return (
        <div className="fixed bottom-8 left-8 z-40 font-mono">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center w-12 h-12 rounded-full glass-panel border border-white/10 text-cyber-cyan hover:text-white hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 hover:scale-105"
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
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">AMBIENT ENGINE</h4>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <Icon name="x" size={16} />
                        </button>
                    </div>

                    {/* Diagnostics (Sci-fi decoration) */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-500 mb-4 bg-black/30 p-2 rounded border border-white/5">
                        <div>ENGINE: <span className="text-green-400 font-bold">READY</span></div>
                        <div>SHADERS: <span className="text-cyber-cyan">WebGL2</span></div>
                        <div>TARGET: <span className="text-cyber-purple uppercase">{bgConfig.theme}</span></div>
                        <div>LOAD: <span className="text-white">NOMINAL</span></div>
                    </div>

                    {/* Theme Selectors */}
                    <div className="mb-4">
                        <span className="block text-[10px] text-gray-400 uppercase tracking-widest mb-2">MATRIX PALETTE</span>
                        <div className="grid grid-cols-2 gap-2">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleThemeChange(t.id)}
                                    className={`p-2 rounded text-left border text-xs transition-all duration-300 flex items-center justify-between ${
                                        bgConfig.theme === t.id
                                            ? 'border-cyber-cyan bg-cyber-cyan/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]'
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

                    {/* Sliders */}
                    <div className="space-y-4">
                        {/* Brightness */}
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                                <span>BRIGHTNESS</span>
                                <span className="text-cyber-cyan">{bgConfig.brightness.toFixed(1)}x</span>
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
                            <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                                <span>DRIFT VELOCITY</span>
                                <span className="text-cyber-cyan">{bgConfig.speed.toFixed(1)}x</span>
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
                </div>
            )}
        </div>
    );
};

export default BackgroundControls;
