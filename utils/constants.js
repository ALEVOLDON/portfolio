// Fallback данные для случая, когда API недоступен
var FALLBACK_PROFILE = {
    login: "ALEVOLDON",
    name: "Vladimir Rybalsky", 
    avatar_url: "https://github.com/ALEVOLDON.png",
    html_url: "https://github.com/ALEVOLDON",
    bio: "Creative Full Stack Developer | React, Three.js, Python | Building digital experiences.",
    public_repos: 24,
    followers: 142,
    following: 38,
    location: "Worldwide",
    created_at: "2017-01-01T00:00:00Z"
};

var FALLBACK_STATS = {
    totalStars: 45,
    totalForks: 12,
    totalSize: 5120,
    totalWatchers: 15,
    grade: 'A',
    languages: [
        { name: 'JavaScript', percent: 65 },
        { name: 'Python', percent: 20 },
        { name: 'TypeScript', percent: 10 },
        { name: 'CSS', percent: 5 }
    ]
};

var FALLBACK_REPOS = [
    { id: 1, name: "jukrainian", description: "Learn Ukrainian language platform.", html_url: "https://github.com/ALEVOLDON/jukrainian", language: "JavaScript", stargazers_count: 10, forks_count: 2 },
    { id: 2, name: "sc_liked_to_playlist_web", description: "Convert SoundCloud liked tracks to playlists.", html_url: "https://github.com/ALEVOLDON/sc_liked_to_playlist_web", language: "Python", stargazers_count: 15, forks_count: 4 },
    { id: 3, name: "Smart-Daw-Landing-React", description: "Landing page for a Smart DAW application.", html_url: "https://github.com/ALEVOLDON/Smart-Daw-Landing-React", language: "JavaScript", stargazers_count: 8, forks_count: 1 },
    { id: 4, name: "habit-tracker", description: "A simple and effective habit tracking app.", html_url: "https://github.com/ALEVOLDON/habit-tracker", language: "TypeScript", stargazers_count: 12, forks_count: 3 },
    { id: 5, name: "acid-synth", description: "Web-based acid synthesizer.", html_url: "https://github.com/ALEVOLDON/acid-synth", language: "JavaScript", stargazers_count: 20, forks_count: 5 },
    { id: 6, name: "CineBlocker", description: "Browser extension to block spoilers.", html_url: "https://github.com/ALEVOLDON/CineBlocker", language: "JavaScript", stargazers_count: 18, forks_count: 2 }
];

var FALLBACK_README = `# ALEVOLDON

Creative Full Stack Developer

## Skills
- React, Three.js, Python
- Building digital experiences

## Projects
Check out my repositories on GitHub!`;

