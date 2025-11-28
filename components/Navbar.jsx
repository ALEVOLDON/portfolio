// Навигационная панель
const Navbar = ({ activeSection, scrollTo }) => {
    const navItems = ['Home', 'About', 'Projects', 'Contact'];
    return (
        <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-xl font-bold tracking-tighter cursor-pointer flex items-center gap-2" onClick={() => scrollTo('home')}>
                    <span className="text-white">ALEVOLDON</span>
                    <span className="text-cyber-cyan">.DEV</span>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
                    {navItems.map(item => (
                        <button
                            key={item}
                            onClick={() => scrollTo(item.toLowerCase())}
                            className={`hover:text-cyber-cyan transition-colors uppercase tracking-widest text-xs py-2 border-b-2 ${activeSection === item.toLowerCase() ? 'border-cyber-cyan text-white' : 'border-transparent'}`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <div className="md:hidden text-white"><Icon name="menu" /></div>
            </div>
        </nav>
    );
};


