import React from 'react';
import Icon from './Icon';
import { translations } from '../data/translations';

const About = ({ profile, stats, language = 'en' }) => {
    const t = translations[language].about;

    const langColors = {
        'JavaScript': '#facc15', 'TypeScript': '#2563eb', 'HTML': '#f97316', 'CSS': '#3b82f6',
        'Python': '#eab308', 'Vue': '#22c55e', 'React': '#22d3ee', 'Go': '#06b6d4', 'Other': '#6b7280'
    };

    // Calculate "Years Active"
    const getYearsActive = (createdAt) => {
        if (!createdAt) return 0;
        const start = new Date(createdAt);
        const now = new Date();
        const diff = now.getFullYear() - start.getFullYear();
        return diff < 1 ? 1 : diff;
    };

    return (
        <section id="about" className="py-24 px-6 glass-panel border-y border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-16 reveal">
                    <div className="h-px bg-cyber-cyan w-12"></div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest font-cyber cyber-glitch" data-text={t.heading.toUpperCase()}>
                        {t.heading}
                    </h2>
                    <div className="h-px bg-white/10 flex-grow"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: STATS DASHBOARD (Span 5) */}
                    <div className="lg:col-span-5 space-y-4">

                        {/* 1. Main Stats Panel (Visual Match to Screenshot) */}
                        <div className="bg-cyber-dark border border-white/10 rounded-xl p-5 hover:border-cyber-purple/50 hover:shadow-[0_0_25px_rgba(var(--secondary-color-rgb),0.15)] transition-all duration-300 reveal reveal-left tech-corners corners-purple">
                            <h3 className="text-sm font-bold text-cyber-purple mb-4 flex items-center gap-2 uppercase tracking-widest font-cyber">
                                {t.gitTitle}
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2 text-sm font-medium font-display">
                                    <div className="flex items-center gap-2 text-white"><Icon name="star" size={14} className="text-yellow-400" /> {language === 'ru' ? 'Звезд' : 'Total Stars'}: <span className="ml-auto font-bold font-cyber">{stats?.totalStars || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="git-fork" size={14} className="text-blue-400" /> {language === 'ru' ? 'Форков' : 'Total Forks'}: <span className="ml-auto font-bold font-cyber">{stats?.totalForks || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="folder-git" size={14} className="text-cyber-cyan" /> {language === 'ru' ? 'Репозиториев' : 'Total Repos'}: <span className="ml-auto font-bold font-cyber">{profile?.public_repos || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="users" size={14} className="text-pink-500" /> {language === 'ru' ? 'Подписчиков' : 'Followers'}: <span className="ml-auto font-bold font-cyber">{profile?.followers || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="eye" size={14} className="text-green-400" /> {language === 'ru' ? 'Просмотров' : 'Watchers'}: <span className="ml-auto font-bold font-cyber">{stats?.totalWatchers || 0}</span></div>
                                </div>

                                {/* Grade Circle */}
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-cyber-purple)" strokeWidth="8" strokeDasharray="283" strokeDashoffset="40" strokeLinecap="round" transform="rotate(-90 50 50)" />
                                    </svg>
                                    <div className="absolute text-3xl font-black text-white font-cyber">{stats?.grade || 'B+'}</div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Languages Panel (Visual Match to Screenshot) */}
                        <div className="bg-cyber-dark border border-white/10 rounded-xl p-5 hover:border-cyber-cyan/50 hover:shadow-[0_0_25px_rgba(var(--primary-color-rgb),0.15)] transition-all duration-300 reveal reveal-left tech-corners corners-cyan" style={{ transitionDelay: '100ms' }}>
                            <h3 className="text-sm font-bold text-cyber-cyan mb-4 flex items-center gap-2 uppercase tracking-widest font-cyber">
                                {t.gitLangs}
                            </h3>
                            {stats?.languages && stats.languages.length > 0 ? (
                                <>
                                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex mb-4">
                                        {stats.languages.map((lang, index) => (
                                            <div key={index} style={{ width: `${lang.percent}%`, backgroundColor: langColors[lang.name] || langColors['Other'] }} className="h-full hover:opacity-80 transition-opacity"></div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 font-display">
                                        {stats.languages.map((lang, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[lang.name] || langColors['Other'] }}></span>
                                                <span className="text-gray-300">{lang.name}</span>
                                                <span className="text-zinc-400 ml-auto font-cyber">{lang.percent}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500 italic">No language data available.</div>
                            )}
                        </div>

                        {/* 3. Activity/Streaks Panel (Visual Match to Screenshot) */}
                        <div className="bg-cyber-dark border border-white/10 rounded-xl p-6 hover:border-pink-500/50 hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] transition-all duration-300 flex items-center justify-between reveal reveal-left font-display tech-corners corners-pink" style={{ transitionDelay: '200ms' }}>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-pink-500 mb-1 font-cyber">
                                    {stats?.totalSize > 1024 ? `${(stats.totalSize / 1024).toFixed(1)}MB` : `${stats.totalSize}KB`}
                                </div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-display">{language === 'ru' ? 'Общий объем кода' : 'Total Code Volume'}</div>
                                <div className="text-[10px] text-zinc-500 mt-1">{language === 'ru' ? 'Примерно' : 'Estimated size'}</div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                                    <svg className="w-full h-full animate-pulse" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="6" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#ec4899" strokeWidth="6" strokeDasharray="283" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 50 50)" />
                                        <path d="M50 25 Q65 50 50 75 Q35 50 50 25" fill="#ec4899" opacity="0.5" />
                                    </svg>
                                    <div className="absolute text-2xl font-black text-white font-cyber">{getYearsActive(profile?.created_at)}</div>
                                </div>
                                <div className="text-xs font-bold text-cyber-cyan uppercase tracking-wider font-display">{language === 'ru' ? 'Лет активности' : 'Years Active'}</div>
                                <div className="text-[10px] text-zinc-400">{language === 'ru' ? 'С' : 'Since'} {profile?.created_at ? new Date(profile.created_at).getFullYear() : 'Unknown'}</div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-pink-500 mb-1 font-cyber">{profile?.public_repos || 0}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-display">{language === 'ru' ? 'Публичных работ' : 'Public Projects'}</div>
                                <div className="text-[10px] text-zinc-500 mt-1">Open Source</div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: PROFILE DETAILS */}
                    <div className="lg:col-span-7 reveal reveal-right" style={{ transitionDelay: '300ms' }}>
                        <div className="h-full p-8 bg-cyber-dark/80 border border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] rounded-xl relative overflow-hidden group min-h-[500px] transition-all duration-300 tech-corners corners-white">
                            <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
                                <Icon name="file-code" size={300} />
                            </div>
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <h3 className="text-md font-bold text-white flex items-center gap-2 font-cyber tracking-wider">
                                    <span className="text-cyber-purple font-mono">cat</span> SYSTEM_PROFILE.md
                                </h3>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
                                </div>
                            </div>
                            <div className="space-y-6 font-display h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                <div>
                                    <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3 font-mono">{t.bioHeader}</h4>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        {t.bioText}
                                    </p>
                                </div>
                                
                                <div className="border-t border-white/5 pt-6">
                                    <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">{t.radarHeader}</h4>
                                    <div className="bg-cyber-dark/40 border border-cyber-purple/30 rounded-xl p-5 relative overflow-hidden tech-corners corners-purple">
                                        {/* Status indicator */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            <span className="text-[9px] font-mono text-green-400 uppercase tracking-widest font-bold">{t.statusLabel}</span>
                                        </div>
                                        
                                        <ul className="space-y-2.5 font-mono text-[11px] text-zinc-400">
                                            {t.items.map((item, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-cyber-purple font-bold">▶</span>
                                                    <span>{item.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                                    <span>{t.capacityLabel}: 40%</span>
                                    <span>{t.telemetryLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
