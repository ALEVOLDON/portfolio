import React, { useEffect, useRef } from 'react';
import AudioService from '../services/AudioService';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);

    const mouseRef = useRef({ x: -100, y: -100 });
    const ringPosRef = useRef({ x: -100, y: -100 });

    useEffect(() => {
        // Hide if touch device (no mouse pointer)
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        if (isTouchDevice) return;

        document.documentElement.classList.add('custom-cursor-active');

        // Show cursor elements
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';

        const setRingSize = (size) => {
            if (!ringRef.current) return;
            const halfSize = size / 2;
            ringRef.current.style.width = `${size}px`;
            ringRef.current.style.height = `${size}px`;
            ringRef.current.style.marginLeft = `${-halfSize}px`;
            ringRef.current.style.marginTop = `${-halfSize}px`;
        };

        const onMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
            
            // Ensure they are visible when moving
            if (dotRef.current && dotRef.current.style.opacity === '0') {
                dotRef.current.style.opacity = '1';
            }
            if (ringRef.current && ringRef.current.style.opacity === '0') {
                ringRef.current.style.opacity = '1';
            }
        };

        const onMouseDown = () => {
            AudioService.playClick();
            setRingSize(24);
            if (ringRef.current) {
                ringRef.current.classList.add('border-white', 'bg-white/10');
            }
        };

        const onMouseUp = () => {
            const isCurrentlyHovered = ringRef.current && ringRef.current.classList.contains('border-cyber-purple');
            setRingSize(isCurrentlyHovered ? 48 : 32);
            if (ringRef.current) {
                ringRef.current.classList.remove('border-white', 'bg-white/10');
            }
        };

        const onMouseLeave = () => {
            if (dotRef.current) dotRef.current.style.opacity = '0';
            if (ringRef.current) ringRef.current.style.opacity = '0';
        };

        const onMouseEnter = () => {
            if (dotRef.current) dotRef.current.style.opacity = '1';
            if (ringRef.current) ringRef.current.style.opacity = '1';
        };

        const onMouseOver = (e) => {
            const el = e.target;
            if (el && (
                el.tagName === 'A' ||
                el.tagName === 'BUTTON' ||
                el.tagName === 'INPUT' ||
                el.tagName === 'TEXTAREA' ||
                el.closest('a') ||
                el.closest('button') ||
                el.closest('[role="button"]') ||
                el.closest('.hoverable') ||
                el.closest('.group')
            )) {
                AudioService.playTick();
                setRingSize(48);
                if (ringRef.current) {
                    ringRef.current.classList.add('border-cyber-purple', 'bg-cyber-purple/5');
                }
            }
        };

        const onMouseOut = (e) => {
            const el = e.target;
            if (el && (
                el.tagName === 'A' ||
                el.tagName === 'BUTTON' ||
                el.tagName === 'INPUT' ||
                el.tagName === 'TEXTAREA' ||
                el.closest('a') ||
                el.closest('button') ||
                el.closest('[role="button"]') ||
                el.closest('.hoverable') ||
                el.closest('.group')
            )) {
                setRingSize(32);
                if (ringRef.current) {
                    ringRef.current.classList.remove('border-cyber-purple', 'bg-cyber-purple/5');
                }
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        document.body.addEventListener('mouseleave', onMouseLeave);
        document.body.addEventListener('mouseenter', onMouseEnter);
        window.addEventListener('mouseover', onMouseOver);
        window.addEventListener('mouseout', onMouseOut);

        // Easing Loop
        let animationFrameId;
        const tick = () => {
            const ease = 0.15; // Smooth trailing delay factor
            
            ringPosRef.current.x += (mouseRef.current.x - ringPosRef.current.x) * ease;
            ringPosRef.current.y += (mouseRef.current.y - ringPosRef.current.y) * ease;

            // Direct DOM rendering (bypasses React loop for 60fps/144fps performance)
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
            }
            if (ringRef.current) {
                ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0)`;
            }

            animationFrameId = requestAnimationFrame(tick);
        };
        tick();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            document.body.removeEventListener('mouseleave', onMouseLeave);
            document.body.removeEventListener('mouseenter', onMouseEnter);
            window.removeEventListener('mouseover', onMouseOver);
            window.removeEventListener('mouseout', onMouseOut);
            cancelAnimationFrame(animationFrameId);
            document.documentElement.classList.remove('custom-cursor-active');
        };
    }, []);

    return (
        <>
            {/* Inner Dot */}
            <div
                ref={dotRef}
                className="custom-cursor-dot fixed top-0 left-0 w-1.5 h-1.5 -ml-0.75 -mt-0.75 bg-cyber-cyan rounded-full pointer-events-none z-[9999] mix-blend-screen opacity-0 transition-opacity duration-300"
                style={{ transform: 'translate3d(-100px, -100px, 0)' }}
            />
            {/* Outer Ring */}
            <div
                ref={ringRef}
                className="custom-cursor-ring fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 border-2 border-cyber-cyan/50 rounded-full pointer-events-none z-[9999] mix-blend-screen opacity-0 transition-opacity duration-300"
                style={{ transform: 'translate3d(-100px, -100px, 0)' }}
            />
        </>
    );
};

export default CustomCursor;
