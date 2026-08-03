import React, { Suspense, lazy } from 'react';
import Icon from '../UI/Icon';
import AvatarStatic from '../Three/AvatarStatic';
import { translations } from '../../data/translations';

const InteractiveAvatar = lazy(() => import('../Three/InteractiveAvatar'));

const Hero = ({ theme = 'cyber', profile, loading, scrollTo, language = 'en' }) => {
    const t = translations[language].hero;
    return (
        <section id="home" className="min-h-screen md:h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
            {/* Slight lift so hero sits a bit higher than pure vertical center */}
            <div className="max-w-4xl w-full text-center z-10 -translate-y-6 md:-translate-y-10">
                {loading ? (
                    <div className="flex justify-center"><div className="animate-spin text-cyber-cyan"><Icon name="loader-2" size={48} /></div></div>
                ) : (
                    <div className="reveal reveal-scale">
                        <div className="animate-float">
                            <Suspense fallback={<AvatarStatic />}>
                                <InteractiveAvatar theme={theme} profile={profile} loading={loading} language={language} />
                            </Suspense>
                            <h1 className="font-hero mb-6 leading-[1.05]">
                                <span className="hero-title-shimmer block text-4xl md:text-6xl font-semibold tracking-[-0.03em]">
                                    {t.title}
                                </span>
                                <span className="block mt-3 text-lg md:text-2xl font-medium tracking-[-0.01em] text-white/90">
                                    {t.subtitle}
                                </span>
                            </h1>
                            <p className="font-hero text-base md:text-lg text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed font-normal tracking-[-0.01em]">
                                {t.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => scrollTo('projects')} 
                                    className="btn-glass btn-glass-primary px-6 py-3 flex items-center justify-center gap-2 font-display tracking-wider uppercase text-xs md:text-sm cursor-pointer"
                                >
                                    <Icon name="terminal" size={16} /> {t.viewProjects}
                                </button>
                                <button 
                                    onClick={() => scrollTo('about')} 
                                    className="btn-glass btn-glass-secondary px-6 py-3 flex items-center justify-center gap-2 font-display tracking-wider uppercase text-xs md:text-sm cursor-pointer"
                                >
                                    <Icon name="sliders" size={16} /> {t.workWithMe}
                                </button>
                                <button 
                                    onClick={() => scrollTo('contact')} 
                                    className="btn-glass btn-glass-primary px-6 py-3 flex items-center justify-center gap-2 font-display tracking-wider uppercase text-xs md:text-sm cursor-pointer"
                                >
                                    <Icon name="mail" size={16} /> {t.connect}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Scroll Down Indicator */}
            <div className="absolute bottom-24 left-0 right-0 mx-auto w-fit hidden md:flex flex-col items-center gap-2 text-gray-500 font-mono text-[10px] uppercase tracking-widest pointer-events-none opacity-60 hover:opacity-100 transition-opacity duration-300">
                <span>{t.scrollDown}</span>
                <div className="w-5 h-8 border-2 border-gray-500 rounded-full flex justify-center p-1">
                    <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-bounce"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
