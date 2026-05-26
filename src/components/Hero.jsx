import React from 'react';
import Icon from './Icon';
import InteractiveAvatar from './InteractiveAvatar';

const Hero = ({ profile, loading, scrollTo }) => {
    return (
        <section id="home" className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
            <div className="max-w-4xl w-full text-center z-10">
                {loading ? (
                    <div className="flex justify-center"><div className="animate-spin text-cyber-cyan"><Icon name="loader-2" size={48} /></div></div>
                ) : (
                    <div className="reveal reveal-scale">
                        <div className="animate-float">
                            <InteractiveAvatar profile={profile} loading={loading} />
                            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-widest leading-tight font-cyber">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan via-white to-cyber-purple animate-gradient-x">
                                    {profile?.name || "DEVELOPER"}
                                </span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-display tracking-wide">
                                {profile?.bio || "Building the future of the web."}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={() => scrollTo('projects')} className="px-8 py-3 bg-cyber-cyan text-black font-bold rounded hover:bg-white transition hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 font-display tracking-wider uppercase text-xs md:text-sm">
                                    <Icon name="terminal" size={20} /> View Projects
                                </button>
                                <a href={profile?.html_url} target="_blank" rel="noopener noreferrer" className="px-8 py-3 border border-white/20 rounded font-bold hover:bg-white/10 transition flex items-center justify-center gap-2 font-display tracking-wider uppercase text-xs md:text-sm">
                                    <Icon name="github" size={20} /> GitHub Profile
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Scroll Down Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-gray-500 font-mono text-[10px] uppercase tracking-widest pointer-events-none reveal" style={{ transitionDelay: '500ms' }}>
                <span>Scroll Down</span>
                <div className="w-5 h-8 border-2 border-gray-500 rounded-full flex justify-center p-1">
                    <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-bounce"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
