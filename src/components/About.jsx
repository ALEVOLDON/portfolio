import React from 'react';
import * as marked from 'marked';
import DOMPurify from 'dompurify';
import Icon from './Icon';

const About = ({ profile, readme, stats }) => {
    const langColors = {
        'JavaScript': '#facc15', 'TypeScript': '#2563eb', 'HTML': '#f97316', 'CSS': '#3b82f6',
        'Python': '#eab308', 'Vue': '#22c55e', 'React': '#22d3ee', 'Go': '#06b6d4', 'Other': '#6b7280'
    };

    const createMarkup = (markdown) => {
        if (!markdown) return { __html: "Loading README data..." };
        const html = marked.parse(markdown);
        return { __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }) };
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
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest font-cyber">System Analytics</h2>
                    <div className="h-px bg-white/10 flex-grow"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: STATS DASHBOARD (Span 5) */}
                    <div className="lg:col-span-5 space-y-4">

                        {/* 1. Main Stats Panel (Visual Match to Screenshot) */}
                        <div className="bg-cyber-dark border border-white/10 rounded-xl p-5 hover:border-cyber-purple/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300 reveal reveal-left">
                            <h3 className="text-sm font-bold text-cyber-purple mb-4 flex items-center gap-2 uppercase tracking-widest font-cyber">
                                {profile?.name || "User"}'s GitHub Stats
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2 text-sm font-medium font-display">
                                    <div className="flex items-center gap-2 text-white"><Icon name="star" size={14} className="text-yellow-400" /> Total Stars: <span className="ml-auto font-bold font-cyber">{stats?.totalStars || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="git-fork" size={14} className="text-blue-400" /> Total Forks: <span className="ml-auto font-bold font-cyber">{stats?.totalForks || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="folder-git" size={14} className="text-cyber-cyan" /> Total Repos: <span className="ml-auto font-bold font-cyber">{profile?.public_repos || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="users" size={14} className="text-pink-500" /> Followers: <span className="ml-auto font-bold font-cyber">{profile?.followers || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="eye" size={14} className="text-green-400" /> Watchers: <span className="ml-auto font-bold font-cyber">{stats?.totalWatchers || 0}</span></div>
                                </div>

                                {/* Grade Circle */}
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="8" strokeDasharray="283" strokeDashoffset="40" strokeLinecap="round" transform="rotate(-90 50 50)" />
                                    </svg>
                                    <div className="absolute text-3xl font-black text-white font-cyber">{stats?.grade || 'B+'}</div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Languages Panel (Visual Match to Screenshot) */}
                        <div className="bg-cyber-dark border border-white/10 rounded-xl p-5 hover:border-cyber-cyan/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] transition-all duration-300 reveal reveal-left" style={{ transitionDelay: '100ms' }}>
                            <h3 className="text-sm font-bold text-cyber-cyan mb-4 flex items-center gap-2 uppercase tracking-widest font-cyber">
                                Most Used Languages
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
                                                <span className="text-gray-500 ml-auto font-cyber">{lang.percent}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500 italic">No language data available.</div>
                            )}
                        </div>

                        {/* 3. Activity/Streaks Panel (Visual Match to Screenshot) */}
                        <div className="bg-cyber-dark border border-white/10 rounded-xl p-6 hover:border-pink-500/50 hover:shadow-[0_0_25px_rgba(236,72,153,0.15)] transition-all duration-300 flex items-center justify-between reveal reveal-left font-display" style={{ transitionDelay: '200ms' }}>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-pink-500 mb-1 font-cyber">
                                    {stats?.totalSize > 1024 ? `${(stats.totalSize / 1024).toFixed(1)}MB` : `${stats.totalSize}KB`}
                                </div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-display">Total Code Volume</div>
                                <div className="text-[10px] text-gray-600 mt-1">Estimated size</div>
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
                                <div className="text-xs font-bold text-cyber-cyan uppercase tracking-wider font-display">Years Active</div>
                                <div className="text-[10px] text-gray-500">Since {profile?.created_at ? new Date(profile.created_at).getFullYear() : 'Unknown'}</div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-pink-500 mb-1 font-cyber">{profile?.public_repos || 0}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-display">Public Projects</div>
                                <div className="text-[10px] text-gray-600 mt-1">Open Source</div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: README */}
                    <div className="lg:col-span-7 reveal reveal-right" style={{ transitionDelay: '300ms' }}>
                        <div className="h-full p-8 bg-cyber-dark/80 border border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] rounded-xl relative overflow-hidden group min-h-[500px] transition-all duration-300">
                            <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
                                <Icon name="file-code" size={300} />
                            </div>
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <h3 className="text-md font-bold text-white flex items-center gap-2 font-cyber tracking-wider">
                                    <span className="text-cyber-purple font-mono">cat</span> README.md
                                </h3>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
                                </div>
                            </div>
                            <div
                                className="markdown-content prose prose-invert max-w-none font-mono text-sm text-gray-400 leading-relaxed pl-2 h-[450px] overflow-y-auto pr-2 custom-scrollbar"
                                dangerouslySetInnerHTML={createMarkup(readme)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
