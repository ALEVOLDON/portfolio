import React, { useState, useEffect, useRef } from 'react';
import AudioService from '../services/AudioService';
import RotaryKnob from './RotaryKnob';

const ModularSynth = ({ onClose }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    // Initial position for desktop: floating on the right side of the screen
    const [position, setPosition] = useState({
        x: Math.max(20, window.innerWidth - 420),
        y: Math.max(80, window.innerHeight - 350)
    });

    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Local state to keep track of knob readouts
    const [params, setParams] = useState({ ...AudioService.synthParams });
    const [synthPrompt, setSynthPrompt] = useState('');
    const [aiStatus, setAiStatus] = useState('');

    const handleAiPreset = () => {
        const query = synthPrompt.toLowerCase().trim();
        if (!query) return;

        setAiStatus('Synthesizing...');
        AudioService.playTick();

        setTimeout(() => {
            let preset = null;
            if (query.includes('drone') || query.includes('дроун') || query.includes('космос') || query.includes('space')) {
                preset = {
                    vcoTune: 60,
                    vcoInterval: 1.5,
                    vcfCutoff: 140,
                    vcfReso: 4.5,
                    lfoRate: 0.08,
                    lfoDepth: 180,
                    delayTime: 0.82,
                    delayFeedback: 0.75
                };
                setAiStatus('Space Drone loaded');
            } else if (query.includes('acid') || query.includes('кислот') || query.includes('bass') || query.includes('бас')) {
                preset = {
                    vcoTune: 110,
                    vcoInterval: 1.01,
                    vcfCutoff: 410,
                    vcfReso: 6.2,
                    lfoRate: 0.75,
                    lfoDepth: 120,
                    delayTime: 0.24,
                    delayFeedback: 0.45
                };
                setAiStatus('Acid 303 Bass loaded');
            } else if (query.includes('ambient') || query.includes('эмбиент') || query.includes('relax') || query.includes('релакс')) {
                preset = {
                    vcoTune: 80,
                    vcoInterval: 1.25,
                    vcfCutoff: 210,
                    vcfReso: 2.2,
                    lfoRate: 0.04,
                    lfoDepth: 70,
                    delayTime: 0.62,
                    delayFeedback: 0.65
                };
                setAiStatus('Lush Ambient loaded');
            } else if (query.includes('noise') || query.includes('шум') || query.includes('industrial') || query.includes('индастриал')) {
                preset = {
                    vcoTune: 145,
                    vcoInterval: 1.95,
                    vcfCutoff: 580,
                    vcfReso: 5.8,
                    lfoRate: 1.25,
                    lfoDepth: 280,
                    delayTime: 0.12,
                    delayFeedback: 0.8
                };
                setAiStatus('Industrial Noise loaded');
            } else if (query.includes('glitch') || query.includes('глитч')) {
                preset = {
                    vcoTune: 130,
                    vcoInterval: 1.75,
                    vcfCutoff: 290,
                    vcfReso: 3.5,
                    lfoRate: 1.45,
                    lfoDepth: 240,
                    delayTime: 0.05,
                    delayFeedback: 0.25
                };
                setAiStatus('Micro-Glitch loaded');
            } else {
                // Procedural preset from string hash
                let hash = 0;
                for (let i = 0; i < query.length; i++) {
                    hash = query.charCodeAt(i) + ((hash << 5) - hash);
                }
                const randVal = (min, max, offset) => {
                    const r = Math.abs(Math.sin(hash + offset));
                    return min + r * (max - min);
                };
                preset = {
                    vcoTune: Math.round(randVal(50, 150, 1)),
                    vcoInterval: Number(randVal(1.0, 2.0, 2).toFixed(2)),
                    vcfCutoff: Math.round(randVal(80, 600, 3)),
                    vcfReso: Number(randVal(0.5, 7.0, 4).toFixed(1)),
                    lfoRate: Number(randVal(0.01, 1.5, 5).toFixed(2)),
                    lfoDepth: Math.round(randVal(10, 300, 6)),
                    delayTime: Number(randVal(0.0, 1.0, 7).toFixed(2)),
                    delayFeedback: Number(randVal(0.0, 0.85, 8).toFixed(2))
                };
                setAiStatus(`Custom: "${query.slice(0, 10)}"`);
            }

            if (preset) {
                AudioService.setVcoTune(preset.vcoTune);
                AudioService.setVcoInterval(preset.vcoInterval);
                AudioService.setVcfCutoff(preset.vcfCutoff);
                AudioService.setVcfReso(preset.vcfReso);
                AudioService.setLfoRate(preset.lfoRate);
                AudioService.setLfoDepth(preset.lfoDepth);
                AudioService.setDelayTime(preset.delayTime);
                AudioService.setDelayFeedback(preset.delayFeedback);

                setParams(preset);
                
                // Fire update event so AudioService synched components update
                window.dispatchEvent(new CustomEvent('synthParamsUpdated'));
            }
        }, 400);
    };

    // Handle screen resize to toggle mobile layout and update limits
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);
            if (!mobile) {
                // Readjust desktop positioning to stay within view bounds
                setPosition(prev => ({
                    x: Math.min(window.innerWidth - 400, Math.max(20, prev.x)),
                    y: Math.min(window.innerHeight - 350, Math.max(80, prev.y))
                }));
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Synchronize knob states when theme changes or values reset
    useEffect(() => {
        const syncParams = () => {
            setParams({ ...AudioService.synthParams });
        };
        window.addEventListener('synthParamsUpdated', syncParams);
        return () => window.removeEventListener('synthParamsUpdated', syncParams);
    }, []);

    // Drag-and-drop window logic (Desktop only)
    const handleMouseDown = (e) => {
        if (isMobile) return;
        if (e.button !== 0 || e.target.closest('button') || e.target.closest('input')) return;
        isDragging.current = true;
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current || isMobile) return;
        const newX = Math.max(0, Math.min(window.innerWidth - 380, e.clientX - dragOffset.current.x));
        const newY = Math.max(60, Math.min(window.innerHeight - 350, e.clientY - dragOffset.current.y));
        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Synth Parameter set triggers
    const handleParamChange = (key, val, setter) => {
        setter.call(AudioService, val);
        setParams(prev => ({ ...prev, [key]: val }));
    };

    const handleReset = () => {
        AudioService.resetSynth();
        setParams({ ...AudioService.synthParams });
    };

    return (
        <div
            className={`fixed z-50 bg-zinc-950/95 backdrop-blur-md shadow-2xl overflow-hidden font-mono select-none transition-all duration-200 border-white/10 ${
                isMobile 
                    ? 'bottom-0 left-0 right-0 w-full rounded-t-2xl border-t border-x pb-4 animate-slideUp' 
                    : 'rounded-xl border w-[380px] animate-fadeIn'
            }`}
            style={isMobile ? {
                boxShadow: '0 -15px 35px rgba(0,0,0,0.7)'
            } : {
                left: `${position.x}px`,
                top: `${position.y}px`,
                boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
        >
            {/* Modular Casing Eurorack Rails */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-neutral-600 border-b border-black" />
            {!isMobile && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-neutral-600 border-t border-black" />}

            {/* Panel Header */}
            <div
                onMouseDown={isMobile ? undefined : handleMouseDown}
                className={`px-4 py-2.5 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-white/5 flex justify-between items-center ${
                    isMobile ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                }`}
            >
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping" style={{ filter: 'drop-shadow(0 0 3px #22d3ee)' }} />
                    <h4 className="text-[10px] font-black text-white tracking-widest font-cyber uppercase">EURORACK MODEL CZ-1</h4>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Eurorack Panels (Modules) */}
            <div className={`grid grid-cols-4 divide-x divide-white/5 p-4 bg-zinc-900/30 ${isMobile ? 'gap-1' : ''}`}>
                {/* Module 1: VCO */}
                <div className="flex flex-col items-center justify-between gap-4 px-1">
                    <div className="text-[8px] text-white/50 border border-white/5 px-1 rounded uppercase font-bold tracking-wider font-cyber">VCO</div>
                    <RotaryKnob
                        label="Tune"
                        min={50}
                        max={150}
                        value={params.vcoTune}
                        onChange={(val) => handleParamChange('vcoTune', val, AudioService.setVcoTune)}
                        unit="Hz"
                        decimals={0}
                        size={isMobile ? 42 : 54}
                    />
                    <RotaryKnob
                        label="Fifth"
                        min={1.0}
                        max={2.0}
                        value={params.vcoInterval}
                        onChange={(val) => handleParamChange('vcoInterval', val, AudioService.setVcoInterval)}
                        unit="x"
                        decimals={2}
                        size={isMobile ? 42 : 54}
                    />
                </div>

                {/* Module 2: VCF */}
                <div className="flex flex-col items-center justify-between gap-4 px-1">
                    <div className="text-[8px] text-white/50 border border-white/5 px-1 rounded uppercase font-bold tracking-wider font-cyber">VCF</div>
                    <RotaryKnob
                        label="Cutoff"
                        min={80}
                        max={600}
                        value={params.vcfCutoff}
                        onChange={(val) => handleParamChange('vcfCutoff', val, AudioService.setVcfCutoff)}
                        unit="Hz"
                        decimals={0}
                        size={isMobile ? 42 : 54}
                    />
                    <RotaryKnob
                        label="Reso"
                        min={0.5}
                        max={7.0}
                        value={params.vcfReso}
                        onChange={(val) => handleParamChange('vcfReso', val, AudioService.setVcfReso)}
                        unit="Q"
                        decimals={1}
                        size={isMobile ? 42 : 54}
                    />
                </div>

                {/* Module 3: LFO */}
                <div className="flex flex-col items-center justify-between gap-4 px-1">
                    <div className="text-[8px] text-white/50 border border-white/5 px-1 rounded uppercase font-bold tracking-wider font-cyber">LFO</div>
                    <RotaryKnob
                        label="Rate"
                        min={0.01}
                        max={1.5}
                        value={params.lfoRate}
                        onChange={(val) => handleParamChange('lfoRate', val, AudioService.setLfoRate)}
                        unit="Hz"
                        decimals={2}
                        size={isMobile ? 42 : 54}
                    />
                    <RotaryKnob
                        label="Depth"
                        min={10}
                        max={300}
                        value={params.lfoDepth}
                        onChange={(val) => handleParamChange('lfoDepth', val, AudioService.setLfoDepth)}
                        unit="Hz"
                        decimals={0}
                        size={isMobile ? 42 : 54}
                    />
                </div>

                {/* Module 4: DELAY */}
                <div className="flex flex-col items-center justify-between gap-4 px-1">
                    <div className="text-[8px] text-white/50 border border-white/5 px-1 rounded uppercase font-bold tracking-wider font-cyber">DELAY</div>
                    <RotaryKnob
                        label="Time"
                        min={0.0}
                        max={1.0}
                        value={params.delayTime}
                        onChange={(val) => handleParamChange('delayTime', val, AudioService.setDelayTime)}
                        unit="s"
                        decimals={2}
                        size={isMobile ? 42 : 54}
                    />
                    <RotaryKnob
                        label="Fback"
                        min={0.0}
                        max={0.85}
                        value={params.delayFeedback}
                        onChange={(val) => handleParamChange('delayFeedback', val, AudioService.setDelayFeedback)}
                        unit="%"
                        decimals={2}
                        size={isMobile ? 42 : 54}
                    />
                </div>
            </div>
            
            {/* AI Preset Panel */}
            <div className="px-4 py-2.5 bg-zinc-950 border-t border-white/5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[7px] text-zinc-500 uppercase tracking-widest font-cyber">
                    <span>AI Preset Orchestrator</span>
                    {aiStatus && <span className="text-cyber-cyan font-bold tracking-wider animate-pulse">{aiStatus}</span>}
                </div>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={synthPrompt}
                        onChange={(e) => setSynthPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAiPreset();
                        }}
                        placeholder="drone, acid, ambient, space, noise..."
                        className="w-full bg-black/40 border border-white/10 rounded-full pl-3 pr-14 py-1 text-[9px] text-gray-300 outline-none focus:border-cyber-cyan focus:bg-black/60 font-mono tracking-wide placeholder-zinc-700"
                    />
                    <button
                        onClick={handleAiPreset}
                        className="absolute right-1 px-2.5 py-0.5 rounded-full bg-cyber-cyan hover:bg-white text-black font-bold text-[8px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Bottom Panel controls */}
            <div className="px-4 py-3 bg-zinc-950/80 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e]" />
                    <span className="text-[7px] text-neutral-500 uppercase tracking-widest font-cyber">PATCH ACTIVE</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            handleReset();
                            setSynthPrompt('');
                            setAiStatus('');
                        }}
                        className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5 text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                        title="Restore visual theme default values"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModularSynth;
