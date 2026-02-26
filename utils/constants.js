// Fallback данные для случая, когда API недоступен
var FALLBACK_PROFILE = {
    login: "ALEVOLDON",
    name: "Vladimir Rybalsky", 
    avatar_url: "https://github.com/ALEVOLDON.png",
    html_url: "https://github.com/ALEVOLDON",
    bio: "Ex-artist 🎨 & sound designer 🎧 → Frontend 💻 & Blockchain ⛓ → AI 🤖 & Prompt Engineering ⚡ 🚀 Building digital vibes ✨, tools 🛠 & ideas 💡",
    public_repos: 86,
    followers: 20,
    following: 193,
    location: "Worldwide",
    created_at: "2017-01-01T00:00:00Z"
};

var FALLBACK_STATS = {
    totalStars: 277,
    totalForks: 12,
    totalSize: 5120,
    totalWatchers: 15,
    grade: 'A+',
    languages: [
        { name: 'JavaScript', percent: 40 },
        { name: 'Python', percent: 35 },
        { name: 'HTML', percent: 10 },
        { name: 'TypeScript', percent: 10 },
        { name: 'CSS', percent: 5 }
    ]
};

var FALLBACK_REPOS = [
    { id: 1, name: "jukrainian", description: "Music nonprofit organization established in Ukraine. It's mainly based on the development of the Ukrainian underground scene.", html_url: "https://github.com/ALEVOLDON/jukrainian", language: "HTML", stargazers_count: 0, forks_count: 0 },
    { id: 2, name: "habit-tracker", description: "Habit tracking app built with Node.js, MongoDB, React and Vite. Track, mark, and manage your habits easily.", html_url: "https://github.com/ALEVOLDON/habit-tracker", language: "JavaScript", stargazers_count: 0, forks_count: 0 },
    { id: 3, name: "sc_liked_to_playlist_web", description: "SoundCloud Liked to Playlist Web (Refactored) Этот проект позволяет собрать ваши лайки из SoundCloud, скачать их как MP3 файлы и слушать через локальный веб-плеер.", html_url: "https://github.com/ALEVOLDON/sc_liked_to_playlist_web", language: "Python", stargazers_count: 0, forks_count: 0 },
    { id: 4, name: "acid-synth", description: "An interactive acid synthesizer created with Python and PySide6. Features real-time sound generation, ADSR envelope, effects, and an oscilloscope.", html_url: "https://github.com/ALEVOLDON/acid-synth", language: "Python", stargazers_count: 0, forks_count: 0 },
    { id: 5, name: "Smart-Daw-Landing-React", description: "Smart DAW Landing — лендинг ИИ‑помощника для сведения музыки", html_url: "https://github.com/ALEVOLDON/Smart-Daw-Landing-React", language: "JavaScript", stargazers_count: 0, forks_count: 0 },
    { id: 6, name: "CineBlocker", description: "Приложение для блокировки YouTube/Netflix, если ты не занимался музыкой. Помогает творцам перестать тупить и начать творить.", html_url: "https://github.com/ALEVOLDON/CineBlocker", language: "Python", stargazers_count: 0, forks_count: 0 }
];

var FALLBACK_README = `# Hi, I'm Vladimir — Developer, Artist, and Meaning Engineer

I'm a prompt engineer, vibe coder, and AI enthusiast with a rich background in frontend development, sound design, digital art, and creative technologies.

**What I do:**

* 🎨 Artist and designer turned developer with a creative mindset
* 💻 Frontend: React, Next.js, Tailwind, Web3, Git, REST, GraphQL
* ⚙️ Engineering background in design and manufacturing
* 🤖 Exploring LLMs, generative AI, and custom prompt systems
* 🎧 Creating NFT music and digital art on the blockchain
* ✍️ Writing, generating meaning, and training both my neurons and AI's

**Currently working on:**

* AI-powered projects and tools
* Generative music and visual art
* A SoundCloud playlist aggregator using their API
* Branding for the company \`g_t_w_y\`

**Find me elsewhere:**

* Website / Portfolio
* CodePen
* Blend.io
* Dev.to
* Telegram
* X / Twitter

---

> Life is short — code while you're alive.`;

