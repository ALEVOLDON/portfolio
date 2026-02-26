// Секция контактов
const { useState } = React;

const Contact = ({ email }) => {
    const [copied, setCopied] = useState(false);

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
        }
    };

    return (
        <section id="contact" className="py-32 px-6 bg-gradient-to-t from-black via-black to-transparent relative z-10">
            <div className="max-w-2xl mx-auto text-center">
                <div className="inline-block p-3 rounded-full bg-white/5 mb-6 animate-bounce"><Icon name="mail" size={24} className="text-cyber-purple" /></div>
                <h2 className="text-4xl font-bold mb-6 text-white">Initialize Communication</h2>
                <p className="text-gray-400 mb-10 text-lg">Ready to collaborate on the next big thing? <br/>Drop a packet to my inbox.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a href={`mailto:${email}`} className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded hover:bg-gray-200 transition-all">
                        <Icon name="send" size={18} /> Send Email
                    </a>
                    <button 
                        onClick={copyEmail}
                        className={`flex items-center justify-center gap-2 px-8 py-4 border border-white/20 rounded font-bold transition-all ${
                            copied 
                                ? 'bg-cyber-cyan text-black border-cyber-cyan' 
                                : 'text-white hover:bg-white/10 hover:border-cyber-cyan'
                        }`}
                    >
                        <Icon name={copied ? "check" : "copy"} size={18} /> 
                        {copied ? 'Copied!' : 'Copy Email'}
                    </button>
                </div>
                <footer className="mt-24 pt-8 border-t border-white/5 text-gray-600 text-xs font-mono flex flex-col md:flex-row justify-between items-center gap-4">
                    <span>© {new Date().getFullYear()} ALEVOLDON. All systems nominal.</span>
                    <div className="flex gap-4">
                        <a href="https://github.com/ALEVOLDON" target="_blank" rel="noreferrer" className="hover:text-cyber-cyan transition-colors flex items-center gap-1">
                            <Icon name="github" size={14} /> GitHub
                        </a>
                        <a href="https://twitter.com/AleVoldon" target="_blank" rel="noreferrer" className="hover:text-cyber-cyan transition-colors flex items-center gap-1">
                            <Icon name="twitter" size={14} /> Twitter
                        </a>
                        <a href="https://codepen.io/GTWY" target="_blank" rel="noreferrer" className="hover:text-cyber-cyan transition-colors flex items-center gap-1">
                            <Icon name="code" size={14} /> CodePen
                        </a>
                    </div>
                </footer>
            </div>
        </section>
    );
};


