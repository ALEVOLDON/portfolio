import React, { useState, useMemo, useEffect } from 'react';
import Icon from './Icon';
import GenerativeThumbnail from './GenerativeThumbnail';

const Projects = ({ repos, loading }) => {
    const [activeFilter, setActiveFilter] = useState('All');

    const languages = useMemo(() => {
        if (!repos) return ['All'];
        const langs = new Set();
        repos.forEach(repo => {
            if (repo.language) langs.add(repo.language);
        });
        return ['All', ...Array.from(langs)];
    }, [repos]);

    const filteredRepos = useMemo(() => {
        if (activeFilter === 'All') return repos;
        return repos.filter(repo => repo.language === activeFilter);
    }, [repos, activeFilter]);

    useEffect(() => {
        if (loading || !repos) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('#projects .reveal').forEach(el => {
            if (!el.classList.contains('active')) {
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, [filteredRepos, loading, repos]);

    const getLangColor = (lang) => {
        const map = { 'JavaScript': 'bg-yellow-400', 'TypeScript': 'bg-blue-600', 'HTML': 'bg-orange-500', 'CSS': 'bg-blue-500', 'Python': 'bg-yellow-600', 'Vue': 'bg-green-500', 'React': 'bg-cyber-cyan', 'Go': 'bg-cyan-600' };
        return map[lang] || 'bg-gray-400';
    };

    return (
        <section id="projects" className="py-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 reveal">
                    <h2 className="text-4xl md:text-6xl font-black mb-4">
                        SELECTED <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple to-cyber-cyan">WORKS</span>
                    </h2>
                    <p className="text-gray-500 font-mono mb-8">Exploring the repository matrix</p>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {languages.map(lang => (
                            <button
                                key={lang}
                                onClick={() => setActiveFilter(lang)}
                                className={`px-4 py-2 rounded-full text-sm font-mono border transition-all duration-300 ${activeFilter === lang
                                    ? 'bg-cyber-cyan text-black border-cyber-cyan shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                                    : 'bg-transparent text-gray-400 border-white/10 hover:border-cyber-cyan/50 hover:text-white'
                                    }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center"><Icon name="loader" className="animate-spin text-white" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRepos.map((repo, index) => (
                            <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="group relative bg-cyber-dark border border-white/10 rounded-xl overflow-hidden hover:border-cyber-cyan/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] flex flex-col reveal" style={{ transitionDelay: `${index * 150}ms` }}>
                                <div className="w-full h-48 overflow-hidden border-b border-white/5 relative">
                                    <GenerativeThumbnail seedStr={repo.name} />
                                    <div className="absolute inset-0 bg-cyber-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay"></div>
                                </div>
                                <div className="p-6 flex flex-col h-full flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-white/5 rounded text-cyber-cyan group-hover:bg-cyber-cyan group-hover:text-black transition-colors"><Icon name="git-branch" size={20} /></div>
                                        <Icon name="external-link" size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyber-cyan transition-colors">{repo.name}</h3>
                                    <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3 font-mono leading-relaxed">{repo.description || "No description provided."}</p>
                                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 pt-4 border-t border-white/5 mt-auto">
                                        <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${getLangColor(repo.language)}`}></span>{repo.language || 'Code'}</div>
                                        <div className="flex gap-4">
                                            <span className="flex items-center gap-1 hover:text-yellow-400 transition-colors"><Icon name="star" size={12} /> {repo.stargazers_count}</span>
                                            <span className="flex items-center gap-1 hover:text-blue-400 transition-colors"><Icon name="git-fork" size={12} /> {repo.forks_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Projects;
