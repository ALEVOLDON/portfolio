// Секция контактов
const Contact = ({ email }) => {
    return (
        <section id="contact" className="py-32 px-6 bg-gradient-to-t from-black via-black to-transparent relative z-10">
            <div className="max-w-2xl mx-auto text-center">
                <div className="inline-block p-3 rounded-full bg-white/5 mb-6 animate-bounce"><Icon name="mail" size={24} className="text-cyber-purple" /></div>
                <h2 className="text-4xl font-bold mb-6 text-white">Initialize Communication</h2>
                <p className="text-gray-400 mb-10 text-lg">Ready to collaborate on the next big thing? <br/>Drop a packet to my inbox.</p>
                <div className="flex justify-center gap-4">
                    <a href={`mailto:${email}`} className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded hover:bg-gray-200 transition-all">
                        <Icon name="send" size={18} /> Send Email
                    </a>
                </div>
                <footer className="mt-24 pt-8 border-t border-white/5 text-gray-600 text-xs font-mono flex flex-col md:flex-row justify-between items-center gap-4">
                    <span>© {new Date().getFullYear()} ALEVOLDON. All systems nominal.</span>
                    <div className="flex gap-4">
                        <span className="hover:text-cyber-cyan cursor-pointer transition-colors">GitHub</span>
                        <span className="hover:text-cyber-cyan cursor-pointer transition-colors">Twitter</span>
                        <span className="hover:text-cyber-cyan cursor-pointer transition-colors">LinkedIn</span>
                    </div>
                </footer>
            </div>
        </section>
    );
};


