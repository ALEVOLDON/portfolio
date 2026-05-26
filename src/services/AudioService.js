class AudioService {
    constructor() {
        this.ctx = null;
        // Modes: 'silent', 'ui', 'immersive'
        this.mode = localStorage.getItem('audioMode') || 'silent';
        this.theme = 'cyber'; // Default visual theme
        
        // Web Audio nodes
        this.ambientDrone = null;
        this.masterGain = null;
        this.delayNode = null;
        this.delayFeedback = null;
        this.initialized = false;
        
        // Synth parameters (default values, modifiable via Eurorack panel)
        this.synthParams = {
            vcoTune: 55.0,        // 50Hz to 150Hz
            vcoInterval: 1.5,     // 1.0 to 2.0 (1.5 = perfect fifth)
            vcfCutoff: 130.0,     // 80Hz to 600Hz
            vcfReso: 0.8,         // 0.5 to 7.0 (Q-factor)
            lfoRate: 0.05,        // 0.01Hz to 1.5Hz
            lfoDepth: 35.0,       // 10Hz to 300Hz
            delayTime: 0.3,       // 0.0s to 1.0s
            delayFeedback: 0.4    // 0.0 to 0.85
        };
        
        this.isSynthTweaked = false;
        
        // Interaction listener
        this.resumeListener = this.resumeContext.bind(this);
    }
    
    // Initialize context on first user interaction
    init() {
        if (this.initialized) return;
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.warn("AudioService: Web Audio API not supported in this browser.");
            return;
        }
        
        try {
            this.ctx = new AudioContext();
            
            // Create master gain node
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.mode === 'silent' ? 0.0001 : 1.0, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            
            // Create global delay node and feedback loop
            this.delayNode = this.ctx.createDelay(1.0); // 1.0s max delay
            this.delayFeedback = this.ctx.createGain();
            
            this.delayNode.connect(this.delayFeedback);
            this.delayFeedback.connect(this.delayNode);
            this.delayNode.connect(this.masterGain);
            
            this.initialized = true;
            console.log("AudioService: Web Audio API context & delay loop initialized. State:", this.ctx.state);
            
            // Load visual theme defaults or restore custom values
            if (!this.isSynthTweaked) {
                this.loadThemeDefaults();
            } else {
                this.updateSynthAudio();
            }
            
            // If immersive mode is set, start the drone
            if (this.mode === 'immersive') {
                this.startAmbientDrone();
            }
        } catch (e) {
            console.error("AudioService: Failed to initialize audio context", e);
        }
    }
    
    // Called on body clicks/touches/keypresses to resume context if suspended
    resumeContext() {
        if (!this.initialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                console.log("AudioService: Web Audio Context resumed successfully. State:", this.ctx.state);
                this.cleanupInteractionListeners();
            }).catch(err => {
                console.warn("AudioService: Could not resume audio context yet:", err);
            });
        } else if (this.ctx && this.ctx.state === 'running') {
            this.cleanupInteractionListeners();
        }
    }
    
    setupInteractionListeners() {
        console.log("AudioService: Setting up interaction listeners to unlock audio.");
        window.addEventListener('click', this.resumeListener, { passive: true });
        window.addEventListener('touchstart', this.resumeListener, { passive: true });
        window.addEventListener('keydown', this.resumeListener, { passive: true });
    }
    
    cleanupInteractionListeners() {
        console.log("AudioService: Cleaning up interaction listeners.");
        window.removeEventListener('click', this.resumeListener);
        window.removeEventListener('touchstart', this.resumeListener);
        window.removeEventListener('keydown', this.resumeListener);
    }
    
    setMode(newMode) {
        if (this.mode === newMode) return;
        
        console.log(`AudioService: Mode changing from "${this.mode}" to "${newMode}"`);
        this.mode = newMode;
        localStorage.setItem('audioMode', newMode);
        
        // Dispatch custom event to notify React components of state changes
        window.dispatchEvent(new CustomEvent('audioModeChanged', { detail: newMode }));
        
        if (newMode === 'silent') {
            if (this.masterGain && this.ctx) {
                // Smoothly fade out master volume first to avoid clicks
                this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
                this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
            }
            // Delay stopping drone until fade out completes
            setTimeout(() => {
                if (this.mode === 'silent') {
                    this.stopAmbientDrone();
                }
            }, 300);
        } else {
            if (!this.initialized) {
                this.init();
            }
            
            if (this.ctx) {
                if (this.ctx.state === 'suspended') {
                    console.log("AudioService: Resuming suspended context inside setMode.");
                    this.ctx.resume().then(() => {
                        console.log("AudioService: Context resumed inside setMode. State:", this.ctx.state);
                    }).catch(e => console.warn(e));
                }
                
                if (this.masterGain) {
                    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
                    this.masterGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.1);
                }
            }
            
            if (newMode === 'immersive') {
                this.startAmbientDrone();
            } else {
                this.stopAmbientDrone();
            }
        }
    }
    
    setTheme(newTheme) {
        if (this.theme === newTheme) return;
        console.log(`AudioService: Theme changing from "${this.theme}" to "${newTheme}"`);
        this.theme = newTheme;
        
        // Only load defaults if the user hasn't tweaked the synth parameters
        if (!this.isSynthTweaked) {
            this.loadThemeDefaults();
        }
    }
    
    loadThemeDefaults() {
        const params = this.getThemeParams();
        this.synthParams.vcoTune = params.freq1;
        this.synthParams.vcoInterval = params.freq2 / params.freq1;
        this.synthParams.vcfCutoff = params.filterBase;
        this.synthParams.vcfReso = params.filterQ;
        this.synthParams.lfoRate = params.lfoRate;
        this.synthParams.lfoDepth = params.filterDepth;
        // Default delay values for themes
        this.synthParams.delayTime = 0.3;
        this.synthParams.delayFeedback = 0.45;
        
        this.updateSynthAudio();
        
        // Dispatch custom event to notify ModularSynth UI component to refresh its knob states!
        window.dispatchEvent(new CustomEvent('synthParamsUpdated'));
    }
    
    // Dynamic setters for the modular rack knobs
    setVcoTune(val) {
        this.synthParams.vcoTune = parseFloat(val);
        this.isSynthTweaked = true;
        this.updateSynthAudio();
    }
    setVcoInterval(val) {
        this.synthParams.vcoInterval = parseFloat(val);
        this.isSynthTweaked = true;
        this.updateSynthAudio();
    }
    setVcfCutoff(val) {
        this.synthParams.vcfCutoff = parseFloat(val);
        this.isSynthTweaked = true;
        this.updateSynthAudio();
    }
    setVcfReso(val) {
        this.synthParams.vcfReso = parseFloat(val);
        this.isSynthTweaked = true;
        this.updateSynthAudio();
    }
    setLfoRate(val) {
        this.synthParams.lfoRate = parseFloat(val);
        this.isSynthTweaked = true;
        this.updateSynthAudio();
    }
    setLfoDepth(val) {
        this.synthParams.lfoDepth = parseFloat(val);
        this.isSynthTweaked = true;
        this.updateSynthAudio();
    }
    setDelayTime(val) {
        this.synthParams.delayTime = parseFloat(val);
        this.isSynthTweaked = true;
        this.updateSynthAudio();
    }
    setDelayFeedback(val) {
        this.synthParams.delayFeedback = parseFloat(val);
        this.isSynthTweaked = true;
        this.updateSynthAudio();
    }
    
    resetSynth() {
        this.isSynthTweaked = false;
        this.loadThemeDefaults();
    }
    
    // Update live Web Audio nodes with the modified synth parameters
    updateSynthAudio() {
        if (!this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // 1. Update delay node parameters (if they exist)
        if (this.delayNode) {
            this.delayNode.delayTime.setTargetAtTime(this.synthParams.delayTime, now, 0.1);
        }
        if (this.delayFeedback) {
            this.delayFeedback.gain.setTargetAtTime(this.synthParams.delayFeedback, now, 0.1);
        }
        
        // 2. Update ambient drone oscillators (if drone is running)
        if (this.ambientDrone) {
            const drone = this.ambientDrone;
            
            drone.osc1.frequency.setTargetAtTime(this.synthParams.vcoTune, now, 0.15);
            drone.osc2.frequency.setTargetAtTime(this.synthParams.vcoTune * this.synthParams.vcoInterval, now, 0.15);
            
            drone.lfo.frequency.setTargetAtTime(this.synthParams.lfoRate, now, 0.1);
            
            drone.filter.Q.setTargetAtTime(this.synthParams.vcfReso, now, 0.1);
            drone.filter.frequency.setTargetAtTime(this.synthParams.vcfCutoff, now, 0.1);
            drone.lfoGain.gain.setTargetAtTime(this.synthParams.lfoDepth, now, 0.1);
        }
    }
    
    // Ambient Drone synthesis
    startAmbientDrone() {
        if (!this.ctx || this.ambientDrone) return;
        
        console.log("AudioService: Starting ambient drone. Theme:", this.theme);
        const now = this.ctx.currentTime;
        
        // We will create two pure sine oscillators to achieve a warm, soft modular-like hum without harsh harmonics
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        
        // LFO for filter sweep
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        
        // Lowpass filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        
        // Soft gain node for breathing effect
        const droneGain = this.ctx.createGain();
        droneGain.gain.setValueAtTime(0.0001, now);
        
        // Connection tree:
        // osc1, osc2 -> filter -> droneGain -> masterGain
        // and droneGain -> delayNode (for spatial wet echo)
        // lfo -> lfoGain -> filter.frequency
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(droneGain);
        
        droneGain.connect(this.masterGain);
        if (this.delayNode) {
            droneGain.connect(this.delayNode);
        }
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        // Store nodes reference
        this.ambientDrone = {
            osc1,
            osc2,
            lfo,
            lfoGain,
            filter,
            droneGain
        };
        
        // Configure notes and speeds based on theme or custom parameters
        this.updateSynthAudio();
        
        osc1.start(now);
        osc2.start(now);
        lfo.start(now);
        
        // Smooth fade-in to a very subtle background volume level (0.08)
        droneGain.gain.cancelScheduledValues(now);
        droneGain.gain.setTargetAtTime(0.08, now, 2.0);
    }
    
    stopAmbientDrone() {
        if (!this.ambientDrone || !this.ctx) return;
        
        console.log("AudioService: Stopping ambient drone.");
        const drone = this.ambientDrone;
        const now = this.ctx.currentTime;
        
        // Fade out drone gain first
        drone.droneGain.gain.cancelScheduledValues(now);
        drone.droneGain.gain.setTargetAtTime(0.0001, now, 0.1);
        
        // Stop oscillators after fade out completes
        const stopOscs = drone;
        setTimeout(() => {
            try {
                stopOscs.osc1.stop();
                stopOscs.osc2.stop();
                stopOscs.lfo.stop();
                
                stopOscs.osc1.disconnect();
                stopOscs.osc2.disconnect();
                stopOscs.lfo.disconnect();
                stopOscs.lfoGain.disconnect();
                stopOscs.filter.disconnect();
                stopOscs.droneGain.disconnect();
            } catch {
                // Safe check if stopped already
            }
        }, 200);
        
        this.ambientDrone = null;
    }
    
    getThemeParams() {
        // We use perfect fifth intervals (1.5:1 ratio) to ensure deep, relaxing musicality.
        // Q values and filter cutoffs are kept extremely low to completely eliminate harshness.
        switch (this.theme) {
            case 'solar':
                return {
                    freq1: 65.41,   // C2 (32.7Hz fundamental octave)
                    freq2: 98.00,   // G2 (Warm fifth)
                    lfoRate: 0.04,  // Slow solar drift
                    filterBase: 160,
                    filterDepth: 50,
                    filterQ: 0.8,
                    tickFreqStart: 600,
                    tickFreqEnd: 200,
                    tickDecay: 0.08
                };
            case 'emerald':
                return {
                    freq1: 58.27,   // A#1
                    freq2: 87.31,   // F2 (Liquid forest resonance)
                    lfoRate: 0.06,  // Smooth breathing
                    filterBase: 140,
                    filterDepth: 40,
                    filterQ: 0.7,
                    tickFreqStart: 1000,
                    tickFreqEnd: 500,
                    tickDecay: 0.04
                };
            case 'void':
                return {
                    freq1: 48.99,   // G1
                    freq2: 73.42,   // D2 (Deep outer-space hum)
                    lfoRate: 0.02,  // Stationary drift
                    filterBase: 90,
                    filterDepth: 25,
                    filterQ: 0.5,
                    tickFreqStart: 1200,
                    tickFreqEnd: 800,
                    tickDecay: 0.02
                };
            case 'cyber':
            default:
                return {
                    freq1: 55.00,   // A1
                    freq2: 82.41,   // E2 (Soothing digital fifth)
                    lfoRate: 0.05,  // Normal cyber pulse
                    filterBase: 130,
                    filterDepth: 35,
                    filterQ: 0.8,
                    tickFreqStart: 800,
                    tickFreqEnd: 300,
                    tickDecay: 0.05
                };
        }
    }
    
    // Play short hover tick for UI elements
    playTick() {
        if (this.mode === 'silent') return;
        if (!this.initialized || !this.ctx) return;
        
        console.log("AudioService: playTick execution started.");
        const now = this.ctx.currentTime;
        const params = this.getThemeParams();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        if (this.delayNode) {
            gain.connect(this.delayNode); // Feed tick to modular delay loop
        }
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(params.tickFreqStart, now);
        osc.frequency.exponentialRampToValueAtTime(params.tickFreqEnd, now + params.tickDecay);
        
        // Subtle volume level (0.1)
        gain.gain.setValueAtTime(0.1, now); 
        gain.gain.exponentialRampToValueAtTime(0.0001, now + params.tickDecay);
        
        osc.start(now);
        osc.stop(now + params.tickDecay + 0.01);
    }
    
    // Play double-pulse organic click feedback
    playClick() {
        if (this.mode === 'silent') return;
        if (!this.initialized || !this.ctx) return;
        
        console.log("AudioService: playClick execution started.");
        const now = this.ctx.currentTime;
        const params = this.getThemeParams();
        
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        if (this.delayNode) {
            gain1.connect(this.delayNode); // Feed click to modular delay
        }
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(params.tickFreqStart * 0.8, now);
        osc1.frequency.exponentialRampToValueAtTime(params.tickFreqEnd * 0.5, now + 0.08);
        
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        
        osc1.start(now);
        osc1.stop(now + 0.09);
        
        // Second offset bounce
        setTimeout(() => {
            if (this.mode === 'silent' || !this.ctx) return;
            const nowOffset = this.ctx.currentTime;
            
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(this.masterGain);
            if (this.delayNode) {
                gain2.connect(this.delayNode);
            }
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(params.tickFreqStart * 0.6, nowOffset);
            osc2.frequency.exponentialRampToValueAtTime(params.tickFreqEnd * 0.4, nowOffset + 0.05);
            
            gain2.gain.setValueAtTime(0.08, nowOffset);
            gain2.gain.exponentialRampToValueAtTime(0.0001, nowOffset + 0.05);
            
            osc2.start(nowOffset);
            osc2.stop(nowOffset + 0.06);
        }, 35);
    }
    
    // Spatial Graph hover note panning based on horizontal screen position
    playSpatialNode(nodeType, xRatio) {
        if (this.mode === 'silent') return;
        if (!this.initialized || !this.ctx) return;
        
        console.log(`AudioService: playSpatialNode execution. Node: ${nodeType}, Pan: ${xRatio.toFixed(2)}`);
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Panner node connection
        const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        
        if (panner) {
            osc.connect(gain);
            gain.connect(panner);
            panner.connect(this.masterGain);
            if (this.delayNode) {
                panner.connect(this.delayNode); // Panned delay feedback loop!
            }
            panner.pan.setValueAtTime(Math.min(Math.max(xRatio, -1.0), 1.0), now);
        } else {
            osc.connect(gain);
            gain.connect(this.masterGain);
            if (this.delayNode) {
                gain.connect(this.delayNode);
            }
        }
        
        const params = this.getThemeParams();
        let freq, duration;
        
        if (nodeType === 'tag') {
            osc.type = 'triangle';
            freq = params.freq2 * 3.0; // Ethereal chime harmonics
            duration = 0.25;
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        } else {
            osc.type = 'sine';
            freq = params.freq2 * 1.5; // Warmer resonant hum
            duration = 0.4;
            
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        }
        
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + duration);
        
        osc.start(now);
        osc.stop(now + duration + 0.01);
    }
}

const audioServiceInstance = new AudioService();
export default audioServiceInstance;
