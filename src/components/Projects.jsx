import React, { useState, useMemo, useEffect, useRef } from 'react';
import Icon from './Icon';
import GenerativeThumbnail from './GenerativeThumbnail';
import { translations } from '../data/translations';

const Projects = ({ repos, loading, language = 'en' }) => {
    const [projectMode, setProjectMode] = useState('featured'); // 'featured' or 'telemetry'
    const [activeFilter, setActiveFilter] = useState('All');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(3);
    const dragStart = useRef({ x: 0, y: 0 });

    const t = translations[language].projects;

    const languages = useMemo(() => {
        if (!repos) return ['All'];
        const langs = new Set();
        repos.forEach(repo => {
            if (repo.language) langs.add(repo.language);
        });
        return ['All', ...Array.from(langs)];
    }, [repos]);

    const activeProjectsList = useMemo(() => {
        if (projectMode === 'featured') {
            return t.items.map((item, idx) => ({
                id: idx,
                name: item.name,
                description: item.description,
                result: item.result,
                html_url: `https://github.com/ALEVOLDON/${item.name}`,
                language: item.language,
                stargazers_count: idx === 0 || idx === 1 || idx === 3 ? 1 : 0,
                forks_count: 0
            }));
        }
        const list = repos || [];
        if (activeFilter === 'All') return list;
        return list.filter(repo => repo.language === activeFilter);
    }, [projectMode, repos, activeFilter, t.items]);

    // Handle responsiveness
    useEffect(() => {
        const updateCardsToShow = () => {
            if (window.innerWidth >= 1024) {
                setCardsToShow(3);
            } else if (window.innerWidth >= 768) {
                setCardsToShow(2);
            } else {
                setCardsToShow(1);
            }
        };

        updateCardsToShow();
        window.addEventListener('resize', updateCardsToShow);
        return () => window.removeEventListener('resize', updateCardsToShow);
    }, []);

    const maxIndex = useMemo(() => {
        const len = activeProjectsList ? activeProjectsList.length : 0;
        return Math.max(0, len - cardsToShow);
    }, [activeProjectsList, cardsToShow]);

    const safeCurrentIndex = Math.min(currentIndex, maxIndex);

    // Scroll reveal observer
    useEffect(() => {
        if (loading || !repos) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('#projects .reveal').forEach(el => {
            if (!el.classList.contains('active')) {
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, [activeProjectsList, loading, repos]);

    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    };

    const handlePointerDown = (e) => {
        dragStart.current = {
            x: e.clientX,
            y: e.clientY
        };
    };

    const handlePointerUp = (e) => {
        if (!dragStart.current) return;
        const diffX = e.clientX - dragStart.current.x;
        const diffY = e.clientY - dragStart.current.y;

        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                handlePrev();
            } else {
                handleNext();
            }
        }
    };

    const getLangColor = (lang) => {
        const map = { 
            'JavaScript': 'bg-yellow-400', 
            'TypeScript': 'bg-blue-600', 
            'HTML': 'bg-orange-500', 
            'CSS': 'bg-blue-500', 
            'Python': 'bg-yellow-600', 
            'Vue': 'bg-green-500', 
            'React': 'bg-cyber-cyan', 
            'Go': 'bg-cyan-600' 
        };
        return map[lang] || 'bg-gray-400';
    };

    const showCarouselControls = maxIndex > 0;

    return (
        <section id="projects" className="py-24 px-6 relative z-10 bg-black/20">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 reveal">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 font-cyber tracking-widest cyber-glitch" data-text={`${t.heading} ${t.headingSpan}`}>
                        {t.heading} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple to-cyber-cyan">{t.headingSpan}</span>
                    </h2>
                    <p className="text-zinc-400 font-display uppercase tracking-widest text-xs mb-8">{t.subheading}</p>

                    {/* Mode Toggle Switch */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6 max-w-lg mx-auto p-1 bg-cyber-dark/80 border border-white/5 rounded-full font-display">
                        <button
                            onClick={() => {
                                setProjectMode('featured');
                                setCurrentIndex(0);
                            }}
                            className={`flex-1 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                                projectMode === 'featured'
                                    ? 'bg-cyber-cyan text-black shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.3)]'
                                    : 'text-zinc-400 hover:text-white bg-transparent'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Icon name="sparkles" size={14} />
                                {t.toggleFeatured}
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                setProjectMode('telemetry');
                                setCurrentIndex(0);
                            }}
                            className={`flex-1 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                                projectMode === 'telemetry'
                                    ? 'bg-cyber-purple text-white shadow-[0_0_15px_rgba(var(--secondary-color-rgb),0.3)]'
                                    : 'text-zinc-400 hover:text-white bg-transparent'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Icon name="folder-git" size={14} />
                                {t.toggleTelemetry}
                            </span>
                        </button>
                    </div>

                    {/* Filter Bar - only visible in telemetry mode */}
                    {projectMode === 'telemetry' && (
                        <div className="flex flex-wrap justify-center gap-3 animate-fadeIn">
                            {languages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => {
                                        setActiveFilter(lang);
                                        setCurrentIndex(0);
                                    }}
                                    className={`px-4 py-2 rounded-full text-xs font-display uppercase tracking-wider border transition-all duration-300 cursor-pointer ${activeFilter === lang
                                        ? 'bg-cyber-purple text-black border-cyber-purple shadow-[0_0_12px_rgba(var(--secondary-color-rgb),0.3)]'
                                        : 'bg-transparent text-gray-400 border-white/10 hover:border-cyber-purple/50 hover:text-white'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading && projectMode === 'telemetry' ? (
                    <div className="flex justify-center py-12"><Icon name="loader" className="animate-spin text-white" size={32} /></div>
                ) : (
                    <div className="relative w-full reveal reveal-scale">
                        {/* Carousel Viewport */}
                        <div 
                            className="overflow-hidden w-full px-1 py-4"
                            onPointerDown={handlePointerDown}
                            onPointerUp={handlePointerUp}
                            style={{ touchAction: 'pan-y' }}
                        >
                            <div 
                                className={`flex transition-transform duration-500 ease-out ${!showCarouselControls ? 'justify-center mx-auto' : ''}`}
                                style={{ 
                                    transform: showCarouselControls 
                                        ? `translateX(-${safeCurrentIndex * (100 / activeProjectsList.length)}%)` 
                                        : 'none',
                                    width: showCarouselControls 
                                        ? `${(activeProjectsList.length / cardsToShow) * 100}%` 
                                        : 'auto'
                                }}
                            >
                                {activeProjectsList.map((repo) => {
                                    const cardWidth = showCarouselControls 
                                        ? `${100 / activeProjectsList.length}%` 
                                        : 'auto';
                                    return (
                                        <div 
                                            key={repo.id || repo.name} 
                                            className="px-3 flex flex-col min-w-0"
                                            style={{ 
                                                width: cardWidth,
                                                maxWidth: !showCarouselControls && cardsToShow === 3 ? 'calc(33.333% - 1.5rem)' : !showCarouselControls && cardsToShow === 2 ? 'calc(50% - 1.5rem)' : '100%'
                                            }}
                                        >
                                            <a 
                                                href={repo.html_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                onDragStart={(e) => e.preventDefault()}
                                                className={`group relative bg-cyber-dark border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] flex flex-col h-full select-none cursor-pointer tech-corners ${
                                                    projectMode === 'featured' 
                                                        ? 'hover:border-cyber-cyan/50 hover:shadow-[0_0_30px_rgba(var(--primary-color-rgb),0.15)] corners-cyan' 
                                                        : 'hover:border-cyber-purple/50 hover:shadow-[0_0_30px_rgba(var(--secondary-color-rgb),0.15)] corners-purple'
                                                }`}
                                            >
                                                <div className="w-full h-44 overflow-hidden border-b border-white/5 relative">
                                                    <GenerativeThumbnail seedStr={repo.name} />
                                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay ${
                                                        projectMode === 'featured' ? 'bg-cyber-cyan/20' : 'bg-cyber-purple/20'
                                                    }`}></div>
                                                </div>
                                                <div className="p-6 flex flex-col h-full flex-grow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className={`p-2 bg-white/5 rounded text-cyber-cyan group-hover:text-black transition-colors ${
                                                            projectMode === 'featured' ? 'group-hover:bg-cyber-cyan' : 'group-hover:bg-cyber-purple group-hover:text-white'
                                                        }`}>
                                                            <Icon name="git-branch" size={18} />
                                                        </div>
                                                        <Icon name="external-link" size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                                                    </div>
                                                    <h3 className={`text-base font-black text-white mb-2 transition-colors font-cyber tracking-wide ${
                                                        projectMode === 'featured' ? 'group-hover:text-cyber-cyan' : 'group-hover:text-cyber-purple'
                                                    }`}>{repo.name}</h3>
                                                    <p className="text-zinc-400 text-xs mb-4 flex-grow line-clamp-3 font-sans leading-relaxed">{repo.description || t.noDesc}</p>
                                                    
                                                    {/* Outcomes / Результат */}
                                                    {projectMode === 'featured' && repo.result && (
                                                        <div className="mb-4 p-3 bg-cyber-cyan/5 border border-cyber-cyan/10 rounded-lg text-xs font-sans text-cyber-cyan">
                                                            <span className="font-bold text-[8px] uppercase tracking-widest text-zinc-500 block mb-1 font-mono">{t.resultLabel}</span>
                                                            {repo.result}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 pt-3 border-t border-white/5 mt-auto font-display tracking-wider uppercase">
                                                        <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${getLangColor(repo.language)}`}></span>{repo.language || 'Code'}</div>
                                                        <div className="flex gap-3 font-cyber">
                                                            <span className="flex items-center gap-1 hover:text-yellow-400 transition-colors"><Icon name="star" size={10} /> {repo.stargazers_count}</span>
                                                            <span className="flex items-center gap-1 hover:text-blue-400 transition-colors"><Icon name="git-fork" size={10} /> {repo.forks_count}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        {showCarouselControls && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    className={`absolute -left-2 md:-left-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border bg-cyber-dark/80 disabled:opacity-25 disabled:pointer-events-none transition-all duration-300 backdrop-blur-md cursor-pointer hidden md:flex ${
                                        projectMode === 'featured' 
                                            ? 'border-cyber-cyan/20 text-cyber-cyan hover:border-cyber-cyan hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.4)]'
                                            : 'border-cyber-purple/20 text-cyber-purple hover:border-cyber-purple hover:shadow-[0_0_15px_rgba(var(--secondary-color-rgb),0.4)]'
                                    }`}
                                    aria-label="Previous slide"
                                >
                                    <Icon name="chevron-left" size={20} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={safeCurrentIndex === maxIndex}
                                    className={`absolute -right-2 md:-right-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border bg-cyber-dark/80 disabled:opacity-25 disabled:pointer-events-none transition-all duration-300 backdrop-blur-md cursor-pointer hidden md:flex ${
                                        projectMode === 'featured' 
                                            ? 'border-cyber-cyan/20 text-cyber-cyan hover:border-cyber-cyan hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.4)]'
                                            : 'border-cyber-purple/20 text-cyber-purple hover:border-cyber-purple hover:shadow-[0_0_15px_rgba(var(--secondary-color-rgb),0.4)]'
                                    }`}
                                    aria-label="Next slide"
                                >
                                    <Icon name="chevron-right" size={20} />
                                </button>
                            </>
                        )}

                        {/* Dot Indicators */}
                        {showCarouselControls && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                            safeCurrentIndex === idx 
                                                ? projectMode === 'featured'
                                                    ? 'w-6 bg-cyber-cyan shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.5)]' 
                                                    : 'w-6 bg-cyber-purple shadow-[0_0_10px_rgba(var(--secondary-color-rgb),0.5)]'
                                                : 'w-2 bg-white/20 hover:bg-white/40'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Projects;
