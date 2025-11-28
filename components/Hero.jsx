// Главная секция с аватаром и приветствием
const Hero = ({ profile, loading, scrollTo }) => {
    return (
        <section id="home" className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
            <div className="max-w-4xl w-full text-center z-10">
                {loading ? (
                     <div className="flex justify-center"><div className="animate-spin text-cyber-cyan"><Icon name="loader-2" size={48} /></div></div>
                ) : (
                    <div className="animate-float">
                        <div className="relative inline-block mb-8 group cursor-pointer">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                            <img src={profile?.avatar_url} alt="Avatar" className="relative w-40 h-40 rounded-full border-2 border-black object-cover" />
                            <div className="absolute bottom-2 right-2 bg-cyber-black rounded-full p-2 border border-cyber-cyan">
                                <Icon name="code" size={16} className="text-cyber-cyan" />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tight leading-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan via-white to-cyber-purple animate-gradient-x">
                                {profile?.name || "DEVELOPER"}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-mono">
                            {profile?.bio || "Building the future of the web."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => scrollTo('projects')} className="px-8 py-3 bg-cyber-cyan text-black font-bold rounded hover:bg-white transition hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2">
                                <Icon name="terminal" size={20} /> View Projects
                            </button>
                            <a href={profile?.html_url} target="_blank" rel="noreferrer" className="px-8 py-3 border border-white/20 rounded font-bold hover:bg-white/10 transition flex items-center justify-center gap-2">
                                <Icon name="github" size={20} /> GitHub Profile
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};


