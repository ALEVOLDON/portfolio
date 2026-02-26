// Навигационная панель
const { useState } = React;

const Navbar = ({ activeSection, scrollTo }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navItems = ['Home', 'About', 'Projects', 'Contact'];

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNavClick = (item) => {
        scrollTo(item.toLowerCase());
        setIsMenuOpen(false);
    };

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
                <div className="md:hidden relative">
                    <button 
                        onClick={handleMenuClick}
                        className="text-white hover:text-cyber-cyan transition-colors p-2"
                        aria-label="Toggle menu"
                    >
                        <Icon name={isMenuOpen ? "x" : "menu"} size={24} />
                    </button>
                    
                    {/* Мобильное меню */}
                    <div 
                        className={`absolute top-full right-0 mt-2 w-48 bg-cyber-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
                            isMenuOpen 
                                ? 'opacity-100 translate-y-0 pointer-events-auto' 
                                : 'opacity-0 -translate-y-4 pointer-events-none'
                        }`}
                    >
                        <div className="py-2">
                            {navItems.map(item => (
                                <button
                                    key={item}
                                    onClick={() => handleNavClick(item)}
                                    className={`w-full text-left px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors ${
                                        activeSection === item.toLowerCase()
                                            ? 'text-cyber-cyan bg-cyber-cyan/10 border-l-2 border-cyber-cyan'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Overlay для закрытия меню при клике вне его */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </nav>
    );
};


