import React, { useRef, useEffect, useState } from 'react';

const RotaryKnob = ({
    label,
    min,
    max,
    value,
    onChange,
    unit = '',
    decimals = 1,
    size = 54
}) => {
    const knobRef = useRef(null);
    const startY = useRef(0);
    const startValue = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    // Calculate rotation angle in degrees (-135 to 135)
    const percentage = (value - min) / (max - min);
    const angle = -135 + percentage * 270;

    const handleMouseDown = (e) => {
        setIsDragging(true);
        startY.current = e.clientY;
        startValue.current = value;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault(); // Prevent text selection
    };

    const handleMouseMove = (e) => {
        const deltaY = startY.current - e.clientY; // drag up = increase
        const pixelRange = 150; // drag 150px to go from min to max
        const valueRange = max - min;
        const deltaValue = (deltaY / pixelRange) * valueRange;
        let newValue = startValue.current + deltaValue;

        // Clamp value
        newValue = Math.max(min, Math.min(max, newValue));
        onChange(newValue);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Touch support for mobile
    const handleTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        setIsDragging(true);
        startY.current = e.touches[0].clientY;
        startValue.current = value;
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        e.preventDefault();
    };

    const handleTouchMove = (e) => {
        if (e.touches.length !== 1) return;
        const deltaY = startY.current - e.touches[0].clientY;
        const pixelRange = 120; // slightly more sensitive on touch
        const valueRange = max - min;
        const deltaValue = (deltaY / pixelRange) * valueRange;
        let newValue = startValue.current + deltaValue;

        newValue = Math.max(min, Math.min(max, newValue));
        onChange(newValue);
        e.preventDefault();
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    };

    useEffect(() => {
        return () => {
            // Clean up listeners on unmount if user drags and unmounts
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const radius = size / 2;
    const center = radius;

    return (
        <div className="flex flex-col items-center select-none font-mono">
            {/* Label */}
            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-cyber font-bold mb-1.5">{label}</span>

            {/* Knob body */}
            <div
                ref={knobRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="relative cursor-ns-resize"
                style={{ width: size, height: size }}
            >
                {/* Visual ticks background */}
                <svg className="absolute inset-0 pointer-events-none transform -rotate-90" width={size} height={size}>
                    {/* Active Track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius - 4}
                        fill="transparent"
                        stroke="rgba(34, 211, 238, 0.1)"
                        strokeWidth="1.5"
                        strokeDasharray={`${(270 / 360) * Math.PI * (size - 8)} ${Math.PI * (size - 8)}`}
                        style={{ transform: `rotate(135deg)`, transformOrigin: 'center' }}
                    />
                    <circle
                        cx={center}
                        cy={center}
                        r={radius - 4}
                        fill="transparent"
                        stroke="#22d3ee"
                        strokeWidth="1.5"
                        strokeDasharray={`${(percentage * (270 / 360)) * Math.PI * (size - 8)} ${Math.PI * (size - 8)}`}
                        style={{ transform: `rotate(135deg)`, transformOrigin: 'center', filter: 'drop-shadow(0 0 2px #22d3ee)' }}
                    />
                </svg>

                {/* Inner Dial */}
                <div
                    className={`absolute inset-1.5 rounded-full transition-shadow duration-300 flex items-center justify-center border ${
                        isDragging
                            ? 'bg-cyber-darker border-cyber-cyan shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                            : 'bg-black border-white/10 hover:border-cyber-cyan/50 hover:shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                    }`}
                    style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'center',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)'
                    }}
                >
                    {/* Metal cap texture */}
                    <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-neutral-900 to-neutral-800" />
                    
                    {/* Notch Pointer */}
                    <div className="absolute top-0 w-0.5 h-2.5 bg-cyber-cyan rounded-full" style={{ filter: 'drop-shadow(0 0 1px #22d3ee)' }} />
                </div>
            </div>

            {/* Readout value display */}
            <div className="mt-1.5 px-1 bg-black/40 border border-white/5 rounded text-[8px] text-cyber-cyan font-bold min-w-10 text-center font-cyber">
                {value.toFixed(decimals)}
                <span className="text-[7px] text-gray-500 ml-0.5">{unit}</span>
            </div>
        </div>
    );
};

export default RotaryKnob;
