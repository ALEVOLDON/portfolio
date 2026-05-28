import React, { useState } from 'react';
import Icon from './Icon';
import AudioService from '../services/AudioService';

const SpotifyPlayer = () => {
    const [isOpen, setIsOpen] = useState(false);

    const togglePlayer = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 font-mono">
            {/* Toggle Button */}
            <button
                onClick={togglePlayer}
                onMouseEnter={() => AudioService.playTick()}
                className={`flex items-center justify-center w-12 h-12 rounded-full glass-panel border border-white/10 text-cyber-cyan hover:text-white hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 hover:scale-105 cursor-pointer relative ${
                    isOpen ? 'bg-cyber-cyan/10 text-white border-cyber-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : ''
                }`}
                title="System Soundtrack"
            >
                {isOpen ? (
                    <Icon name="x" size={20} />
                ) : (
                    <div className="flex items-center justify-center relative">
                        {/* Pulse effect rings */}
                        <span className="absolute -inset-1 rounded-full bg-cyber-cyan/20 animate-ping opacity-75"></span>
                        <Icon name="music" size={20} className="relative z-10 animate-[spin_8s_linear_infinite]" />
                    </div>
                )}
            </button>

            {/* Slide-out Player Panel */}
            <div
                className={`absolute right-16 top-1/2 -translate-y-1/2 w-80 p-4 rounded-2xl capsule-panel border border-white/10 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.8)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isOpen
                        ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-x-6 scale-95 pointer-events-none'
                }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse"></span>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest font-cyber">SOUNDTRACK</h4>
                    </div>
                    <span className="text-[7px] font-mono text-cyber-cyan/70 tracking-widest">SYS_STREAM_OK</span>
                </div>

                {/* Spotify Iframe */}
                <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black/40 shadow-inner">
                    <iframe
                        data-testid="embed-iframe"
                        style={{ borderRadius: '12px', display: 'block' }}
                        src="https://open.spotify.com/embed/playlist/37i9dQZEVXcIaHKy3iJexd?utm_source=generator&theme=0"
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allowFullScreen=""
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                    />
                </div>

                {/* Diagnostics / Decorative telemetry */}
                <div className="flex justify-between text-[7px] text-gray-500 mt-2.5 px-1 font-mono uppercase tracking-widest">
                    <span>FEED: SPOTIFY_STREAM</span>
                    <span>WAVE: ACTIVE</span>
                </div>
            </div>
        </div>
    );
};

export default SpotifyPlayer;
