import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';

const BrainGraph = lazy(() => import('./BrainGraph'));

const BrainGraphPlaceholder = () => (
    <section
        id="brain"
        className="w-full min-h-screen py-24 bg-cyber-black relative overflow-hidden flex flex-col justify-center border-b border-white/5"
        aria-hidden="true"
    >
        <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="h-10 w-56 max-w-full bg-white/5 rounded animate-pulse mb-6" />
            <div className="h-[350px] sm:h-[400px] lg:h-[600px] bg-cyber-dark/40 rounded-2xl border border-white/10 animate-pulse" />
        </div>
    </section>
);

const DeferredBrainGraph = ({ theme, language }) => {
    const sentinelRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    if (!shouldLoad) {
        return (
            <div ref={sentinelRef}>
                <BrainGraphPlaceholder />
            </div>
        );
    }

    return (
        <div ref={sentinelRef}>
            <Suspense fallback={<BrainGraphPlaceholder />}>
                <BrainGraph theme={theme} language={language} />
            </Suspense>
        </div>
    );
};

export default DeferredBrainGraph;