import React from 'react';
import Icon from './Icon';
import InteractiveAvatar from './InteractiveAvatar';
import { translations } from '../data/translations';

const Hero = ({ profile, loading, scrollTo, language = 'en' }) => {
    const t = translations[language].hero;
    return (
        <section id="home" className="min-h-screen md:h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
            <div className="max-w-4xl w-full text-center z-10">
                {loading ? (
                    <div className="flex justify-center"><div className="animate-spin text-cyber-cyan"><Icon name="loader-2" size={48} /></div></div>
                ) : (
                    <div className="reveal reveal-scale">
                        <div className="animate-float">
                            <InteractiveAvatar profile={profile} loading={loading} />
                            <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-widest leading-tight font-cyber">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan via-white to-cyber-purple animate-gradient-x">
                                    {t.title}
                                </span>
                                <span className="text-white block mt-2 text-xl md:text-3xl font-bold tracking-wide">
                                    {t.subtitle}
                                </span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-display tracking-wide">
                                {t.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => scrollTo('projects')} 
                                    className="px-6 py-3 bg-cyber-cyan text-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.55)] flex items-center justify-center gap-2 font-display tracking-wider uppercase text-xs md:text-sm cursor-pointer"
                                >
                                    <Icon name="terminal" size={16} /> {t.viewProjects}
                                </button>
                                <button 
                                    onClick={() => scrollTo('about')} 
                                    className="px-6 py-3 border border-white/25 hover:border-cyber-purple text-white hover:text-cyber-purple rounded-full font-bold hover:bg-cyber-purple/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all duration-300 flex items-center justify-center gap-2 font-display tracking-wider uppercase text-xs md:text-sm cursor-pointer"
                                >
                                    <Icon name="sliders" size={16} /> {t.workWithMe}
                                </button>
                                <button 
                                    onClick={() => scrollTo('contact')} 
                                    className="px-6 py-3 border border-white/25 hover:border-cyber-cyan text-white hover:text-cyber-cyan rounded-full font-bold hover:bg-cyber-cyan/10 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all duration-300 flex items-center justify-center gap-2 font-display tracking-wider uppercase text-xs md:text-sm cursor-pointer"
                                >
                                    <Icon name="mail" size={16} /> {t.connect}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Scroll Down Indicator */}
            <div className="absolute bottom-12 left-0 right-0 mx-auto w-fit hidden md:flex flex-col items-center gap-2 text-gray-500 font-mono text-[10px] uppercase tracking-widest pointer-events-none opacity-60 hover:opacity-100 transition-opacity duration-300">
                <span>Scroll Down</span>
                <div className="w-5 h-8 border-2 border-gray-500 rounded-full flex justify-center p-1">
                    <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-bounce"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
