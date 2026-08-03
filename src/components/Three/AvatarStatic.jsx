import React from 'react';

const AvatarStatic = () => (
    <div className="relative inline-block mb-8 group select-none" aria-hidden="true">
        <div className="absolute -inset-2 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-cyan rounded-full blur-md opacity-30 animate-pulse" />

        <div className="relative w-64 h-64 rounded-full overflow-hidden border border-cyber-cyan/30 bg-cyber-black flex items-center justify-center">
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-full">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent shadow-[0_0_8px_var(--primary-color)] animate-scanline opacity-60" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyber-black z-30 pointer-events-none">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 border border-dashed border-cyber-cyan/30 rounded-full animate-[spin_8s_linear_infinite]" />
                    <div className="absolute -inset-1 border border-cyber-purple/20 rounded-full animate-[spin_12s_linear_infinite]" />
                    <span className="font-mono text-[7px] text-cyber-cyan/50 tracking-widest uppercase animate-pulse">
                        SYS_LOAD
                    </span>
                </div>
            </div>
        </div>
    </div>
);

export default AvatarStatic;