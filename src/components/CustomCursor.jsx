import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const mouseRef = useRef({ x: -100, y: -100 });
    const ringPosRef = useRef({ x: -100, y: -100 });

    useEffect(() => {
        // Hide if touch device (no mouse pointer)
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        if (isTouchDevice) return;

        document.documentElement.classList.add('custom-cursor-active');

        const onMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
            setIsVisible(true);
        };

        const onMouseDown = () => setIsClicked(true);
        const onMouseUp = () => setIsClicked(false);
        const onMouseLeave = () => setIsVisible(false);
        const onMouseEnter = () => setIsVisible(true);

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
                setIsHovered(true);
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
                setIsHovered(false);
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

    if (!isVisible) return null;

    return (
        <>
            {/* Inner Dot */}
            <div
                ref={dotRef}
                className="custom-cursor-dot fixed top-0 left-0 w-1.5 h-1.5 -ml-0.75 -mt-0.75 bg-cyber-cyan rounded-full pointer-events-none z-50 mix-blend-screen"
                style={{ transform: 'translate3d(-100px, -100px, 0)' }}
            />
            {/* Outer Ring */}
            <div
                ref={ringRef}
                className={`custom-cursor-ring fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 border-2 border-cyber-cyan/50 rounded-full pointer-events-none z-50 mix-blend-screen
                    ${isHovered ? 'scale-150 border-cyber-purple bg-cyber-purple/5' : ''}
                    ${isClicked ? 'scale-75 border-white bg-white/10' : ''}
                `}
                style={{ transform: 'translate3d(-100px, -100px, 0)' }}
            />
        </>
    );
};

export default CustomCursor;
