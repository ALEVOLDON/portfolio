// Секция "О себе" с расширенной статистикой GitHub
const About = ({ profile, readme, stats }) => {
    const langColors = {
        'JavaScript': '#facc15', 'TypeScript': '#2563eb', 'HTML': '#f97316', 'CSS': '#3b82f6',
        'Python': '#eab308', 'Vue': '#22c55e', 'React': '#22d3ee', 'Go': '#06b6d4', 'Other': '#6b7280'
    };

    const createMarkup = (markdown) => {
        if (!markdown) return { __html: "Loading README data..." };
        return { __html: marked.parse(markdown) };
    };

    // Вычисление "Years Active"
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
                <div className="flex items-center gap-4 mb-16">
                    <div className="h-px bg-cyber-cyan w-12"></div>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-widest">System Analytics</h2>
                    <div className="h-px bg-white/10 flex-grow"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* ЛЕВАЯ КОЛОНКА: СТАТИСТИКА (Span 5) */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* 1. Основная панель статистики */}
                        <div className="bg-cyber-dark border border-white/10 rounded-xl p-5 hover:border-cyber-purple/50 transition-colors">
                            <h3 className="text-md font-bold text-cyber-purple mb-4 flex items-center gap-2 uppercase tracking-wider">
                                {profile?.name || "User"}'s GitHub Stats
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2 text-sm font-medium">
                                    <div className="flex items-center gap-2 text-white"><Icon name="star" size={14} className="text-yellow-400" /> Total Stars: <span className="ml-auto font-bold">{stats?.totalStars || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="git-fork" size={14} className="text-blue-400" /> Total Forks: <span className="ml-auto font-bold">{stats?.totalForks || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="folder-git" size={14} className="text-cyber-cyan" /> Total Repos: <span className="ml-auto font-bold">{profile?.public_repos || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="users" size={14} className="text-pink-500" /> Followers: <span className="ml-auto font-bold">{profile?.followers || 0}</span></div>
                                    <div className="flex items-center gap-2 text-white"><Icon name="eye" size={14} className="text-green-400" /> Watchers: <span className="ml-auto font-bold">{stats?.totalWatchers || 0}</span></div>
                                </div>
                                
                                {/* Круг с оценкой */}
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="8" strokeDasharray="283" strokeDashoffset="40" strokeLinecap="round" transform="rotate(-90 50 50)" />
                                    </svg>
                                    <div className="absolute text-3xl font-black text-white">{stats?.grade || 'B+'}</div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Панель языков */}
                        <div className="bg-cyber-dark border border-white/10 rounded-xl p-5 hover:border-cyber-cyan/50 transition-colors">
                            <h3 className="text-md font-bold text-cyber-cyan mb-4 flex items-center gap-2 uppercase tracking-wider">
                                Most Used Languages
                            </h3>
                            {stats?.languages && stats.languages.length > 0 ? (
                                <>
                                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex mb-4">
                                        {stats.languages.map((lang, index) => (
                                            <div key={index} style={{ width: `${lang.percent}%`, backgroundColor: langColors[lang.name] || langColors['Other'] }} className="h-full hover:opacity-80 transition-opacity"></div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                                        {stats.languages.map((lang, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[lang.name] || langColors['Other'] }}></span>
                                                <span className="text-gray-300">{lang.name}</span>
                                                <span className="text-gray-500 ml-auto">{lang.percent}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500 italic">No language data available.</div>
                            )}
                        </div>

                        {/* 3. Панель активности/стриков */}
                        <div className="bg-cyber-dark border border-white/10 rounded-xl p-6 hover:border-pink-500/50 transition-colors flex items-center justify-between">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-pink-500 mb-1">
                                    {stats?.totalSize > 1024 ? `${(stats.totalSize / 1024).toFixed(1)}MB` : `${stats.totalSize}KB`}
                                </div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total Code Volume</div>
                                <div className="text-[10px] text-gray-600 mt-1">Estimated size</div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                                    <svg className="w-full h-full animate-pulse" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="6" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#ec4899" strokeWidth="6" strokeDasharray="283" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 50 50)" />
                                        <path d="M50 25 Q65 50 50 75 Q35 50 50 25" fill="#ec4899" opacity="0.5" />
                                    </svg>
                                    <div className="absolute text-2xl font-bold text-white">{getYearsActive(profile?.created_at)}</div>
                                </div>
                                <div className="text-xs font-bold text-cyber-cyan uppercase">Years Active</div>
                                <div className="text-[10px] text-gray-500">Since {new Date(profile?.created_at).getFullYear()}</div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-pink-500 mb-1">{profile?.public_repos || 0}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Public Projects</div>
                                <div className="text-[10px] text-gray-600 mt-1">Open Source</div>
                            </div>
                        </div>

                    </div>

                    {/* ПРАВАЯ КОЛОНКА: README */}
                    <div className="lg:col-span-7">
                        <div className="h-full p-8 bg-cyber-dark/80 border border-white/10 rounded-xl relative overflow-hidden group min-h-[500px]">
                            <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
                                <Icon name="file-code" size={300} />
                            </div>
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-cyber-purple">cat</span> README.md
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


