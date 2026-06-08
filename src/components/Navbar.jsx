import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import AudioService from '../services/AudioService';
import { translations } from '../data/translations';

const Navbar = ({ activeSection, scrollTo, language, setLanguage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [audioMode, setAudioMode] = useState(AudioService.mode);
    const [prevActiveMode, setPrevActiveMode] = useState(localStorage.getItem('prevActiveAudioMode') || 'immersive');
    const navItems = ['Home', 'Create', 'Projects', 'About', 'Brain', 'Contact'];

    const containerRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, height: 0, top: 0, opacity: 0 });

    useEffect(() => {
        const handleModeChange = (e) => {
            const newMode = e.detail;
            setAudioMode(newMode);
            if (newMode !== 'silent') {
                setPrevActiveMode(newMode);
                localStorage.setItem('prevActiveAudioMode', newMode);
            }
        };
        window.addEventListener('audioModeChanged', handleModeChange);
        return () => window.removeEventListener('audioModeChanged', handleModeChange);
    }, []);

    // Calculate active indicator position
    useEffect(() => {
        const updateIndicator = () => {
            if (!containerRef.current) return;
            const activeEl = containerRef.current.querySelector('[data-active="true"]');
            if (activeEl) {
                setIndicatorStyle({
                    left: activeEl.offsetLeft,
                    width: activeEl.offsetWidth,
                    height: activeEl.offsetHeight,
                    top: activeEl.offsetTop,
                    opacity: 1
                });
            } else {
                setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
            }
        };

        // requestAnimationFrame yields correct layout metrics
        const animId = requestAnimationFrame(updateIndicator);
        window.addEventListener('resize', updateIndicator);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', updateIndicator);
        };
    }, [activeSection]);

    const toggleMute = () => {
        if (audioMode === 'silent') {
            AudioService.setMode(prevActiveMode);
        } else {
            AudioService.setMode('silent');
        }
    };

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavClick = (item) => {
        scrollTo(item.toLowerCase());
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* Overlay для закрытия мобильного меню */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px] md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
            <nav className="fixed top-4 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-5xl z-50 px-6 py-2.5 rounded-full capsule-panel capsule-border-glow transition-all duration-300">
                <div className="flex justify-between items-center">
                    <div 
                        className="cylinder-logo-container cursor-pointer select-none" 
                        onClick={() => scrollTo('home')}
                        onMouseEnter={() => AudioService.playTick()}
                    >
                        <div className="cylinder-ring">
                            {"ALEVOLDON · METAVERSE · ".split('').map((char, idx) => (
                                <span 
                                    key={idx} 
                                    className="cylinder-char" 
                                    style={{ '--char-index': idx }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Desktop Nav Items */}
                    <div ref={containerRef} className="hidden md:flex gap-1.5 items-center relative font-display">
                        {/* Sliding Highlight Background */}
                        <div
                            className="absolute bg-cyber-cyan/10 rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none border border-cyber-cyan/20 shadow-[0_0_12px_rgba(var(--primary-color-rgb),0.15)]"
                            style={{
                                left: indicatorStyle.left,
                                width: indicatorStyle.width,
                                height: indicatorStyle.height,
                                top: indicatorStyle.top,
                                opacity: indicatorStyle.opacity
                            }}
                        />
                        
                        {navItems.map(item => (
                            <button
                                key={item}
                                data-active={activeSection === item.toLowerCase()}
                                onClick={() => scrollTo(item.toLowerCase())}
                                onMouseEnter={() => AudioService.playTick()}
                                className={`hover:text-white transition-colors uppercase tracking-widest text-[10px] py-1.5 px-4 rounded-full z-10 relative cursor-pointer ${
                                    activeSection === item.toLowerCase() 
                                        ? 'text-cyber-cyan font-semibold' 
                                        : 'text-gray-400 font-medium'
                                }`}
                            >
                                {translations[language].nav[item.toLowerCase()]}
                            </button>
                        ))}
                    </div>

                    {/* Right controls (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleMute}
                            onMouseEnter={() => AudioService.playTick()}
                            className={`p-1.5 px-3 rounded-full border transition-all duration-300 flex items-center justify-center gap-1.5 hover:scale-105 cursor-pointer ${
                                audioMode !== 'silent'
                                    ? 'border-cyber-cyan/30 text-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_12px_rgba(var(--primary-color-rgb),0.2)] animate-pulse'
                                    : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                            }`}
                            title={audioMode !== 'silent' ? 'Mute Audio' : 'Unmute Audio'}
                        >
                            <Icon name={audioMode !== 'silent' ? "volume-2" : "volume-x"} size={14} />
                            <span className="text-[8px] uppercase tracking-widest font-mono">
                                {audioMode === 'silent' ? 'MUTE' : audioMode === 'ui' ? 'UI FX' : 'AMB'}
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setLanguage(prev => prev === 'en' ? 'ru' : 'en');
                                AudioService.playTick();
                            }}
                            onMouseEnter={() => AudioService.playTick()}
                            className="p-1.5 px-3 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer font-mono text-[9px] font-bold"
                            title="Switch Language / Смена языка"
                        >
                            <span className={language === 'en' ? 'text-cyber-cyan animate-pulse' : 'text-zinc-600'}>EN</span>
                            <span className="text-zinc-700">|</span>
                            <span className={language === 'ru' ? 'text-cyber-cyan animate-pulse' : 'text-zinc-600'}>RU</span>
                        </button>
                    </div>

                    {/* Mobile controls */}
                    <div className="md:hidden relative flex items-center gap-2">
                        <button
                            onClick={toggleMute}
                            onMouseEnter={() => AudioService.playTick()}
                            className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center gap-1 hover:scale-105 cursor-pointer ${
                                audioMode !== 'silent'
                                    ? 'border-cyber-cyan/30 text-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.15)]'
                                    : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                            }`}
                            title={audioMode !== 'silent' ? 'Mute Audio' : 'Unmute Audio'}
                        >
                            <Icon name={audioMode !== 'silent' ? "volume-2" : "volume-x"} size={14} />
                        </button>

                        <button
                            onClick={() => {
                                setLanguage(prev => prev === 'en' ? 'ru' : 'en');
                                AudioService.playTick();
                            }}
                            className="p-2 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all duration-300 flex items-center justify-center hover:scale-105 cursor-pointer font-mono text-[8px] font-bold"
                            title="Switch Language"
                        >
                            {language === 'en' ? 'RU' : 'EN'}
                        </button>

                        <button
                            onClick={handleMenuClick}
                            onMouseEnter={() => AudioService.playTick()}
                            className="text-white hover:text-cyber-cyan transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer"
                            aria-label="Toggle menu"
                        >
                            <Icon name={isMenuOpen ? "x" : "menu"} size={20} />
                        </button>

                        {/* Мобильное меню */}
                        <div
                            className={`absolute top-[calc(100%+0.75rem)] right-0 w-48 bg-cyber-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_15px_50px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 ${
                                isMenuOpen
                                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                                    : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                            }`}
                        >
                            <div className="py-2">
                                {navItems.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => handleNavClick(item)}
                                        onMouseEnter={() => AudioService.playTick()}
                                        className={`w-full text-left px-6 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors font-display cursor-pointer ${
                                            activeSection === item.toLowerCase()
                                                ? 'text-cyber-cyan bg-cyber-cyan/10 border-l-2 border-cyber-cyan'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {translations[language].nav[item.toLowerCase()]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
