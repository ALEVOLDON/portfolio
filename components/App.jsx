// Главный компонент приложения
const { useState, useEffect } = React;

const App = () => {
    const [activeSection, setActiveSection] = useState('home');
    const [profile, setProfile] = useState(null);
    const [repos, setRepos] = useState([]);
    const [readme, setReadme] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalStars: 0, totalForks: 0, totalSize: 0, totalWatchers: 0, grade: 'B', languages: [] });

    useEffect(() => {
        const fetchData = async () => {
            const username = 'ALEVOLDON';
            try {
                // 1. Профиль
                let profileData;
                try {
                    const res = await fetch(`https://api.github.com/users/${username}`);
                    if(res.ok) profileData = await res.json();
                    else throw new Error("Profile API fail");
                } catch(e) {
                    console.warn("Profile fallback");
                    profileData = FALLBACK_PROFILE;
                }
                if (!profileData.name) profileData.name = FALLBACK_PROFILE.name;
                setProfile(profileData);

                // 2. Получение всех репозиториев для статистики
                let allReposForStats = [];
                try {
                    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
                    if(res.ok) {
                        allReposForStats = await res.json();
                    } else {
                        allReposForStats = []; 
                    }
                } catch(e) {
                    console.warn("Stats repo fallback");
                    allReposForStats = [];
                }

                // Вычисление статистики
                const calcStats = { totalStars: 0, totalForks: 0, totalSize: 0, totalWatchers: 0, grade: 'B', languages: [] };
                const langCounts = {};
                let totalLangs = 0;

                if (allReposForStats.length > 0) {
                    allReposForStats.forEach(repo => {
                        calcStats.totalStars += repo.stargazers_count;
                        calcStats.totalForks += repo.forks_count;
                        calcStats.totalSize += repo.size; // в KB
                        calcStats.totalWatchers += repo.watchers_count;
                        
                        if (repo.language) {
                            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
                            totalLangs++;
                        }
                    });

                    // Вычисление оценки (на основе звезд)
                    if (calcStats.totalStars > 100) calcStats.grade = 'S';
                    else if (calcStats.totalStars > 50) calcStats.grade = 'A+';
                    else if (calcStats.totalStars > 20) calcStats.grade = 'A';
                    else if (calcStats.totalStars > 5) calcStats.grade = 'B+';
                    else calcStats.grade = 'B';

                    const langArr = Object.entries(langCounts)
                        .map(([name, count]) => ({ name, count, percent: Math.round((count / totalLangs) * 100) }))
                        .sort((a, b) => b.count - a.count);
                    
                    if (langArr.length > 5) {
                        const top5 = langArr.slice(0, 5);
                        const otherCount = langArr.slice(5).reduce((acc, curr) => acc + curr.count, 0);
                        const otherPercent = Math.round((otherCount / totalLangs) * 100);
                        calcStats.languages = [...top5, { name: 'Other', count: otherCount, percent: otherPercent }];
                    } else {
                        calcStats.languages = langArr;
                    }
                } else {
                    // Использование fallback если API недоступен
                    calcStats.totalStars = FALLBACK_STATS.totalStars;
                    calcStats.totalForks = FALLBACK_STATS.totalForks;
                    calcStats.totalSize = FALLBACK_STATS.totalSize;
                    calcStats.totalWatchers = FALLBACK_STATS.totalWatchers;
                    calcStats.grade = FALLBACK_STATS.grade;
                    calcStats.languages = FALLBACK_STATS.languages;
                }

                setStats(calcStats);

                // 3. Получение конкретных закрепленных проектов для отображения
                const pinnedNames = [
                    'jukrainian', 
                    'habit-tracker', 
                    'sc_liked_to_playlist_web', 
                    'acid-synth', 
                    'Smart-Daw-Landing-React', 
                    'CineBlocker'
                ];
                
                let pinnedRepos = [];
                try {
                    const requests = pinnedNames.map(name => 
                        fetch(`https://api.github.com/repos/${username}/${name}`).then(res => res.ok ? res.json() : null)
                    );
                    const results = await Promise.all(requests);
                    pinnedRepos = results.filter(r => r !== null);
                } catch (e) {
                    console.warn("Pinned repos fetch failed");
                }

                setRepos(pinnedRepos.length > 0 ? pinnedRepos : FALLBACK_REPOS);

                // 4. Readme
                try {
                    let text = "";
                    const branches = ['main', 'master'];
                    for(let branch of branches) {
                        const res = await fetch(`https://raw.githubusercontent.com/${username}/${username}/${branch}/README.md`);
                        if(res.ok) {
                            text = await res.text();
                            break;
                        }
                    }
                    if(text) {
                        const cleanText = text
                            .replace(/!\[.*?\]\(.*?github-readme-stats.*?\)/g, '')
                            .replace(/!\[.*?\]\(.*?github-profile-trophy.*?\)/g, '')
                            .replace(/!\[.*?\]\(.*?github-readme-streak-stats.*?\)/g, '')
                            .replace(/!\[.*?\]\(.*?komarev\.com\/ghpvc.*?\)/g, '')
                            .replace(/<img.*?src=".*?github-readme-stats.*?".*?>/g, '');
                        setReadme(cleanText);
                    } else {
                        setReadme(FALLBACK_README);
                    }
                } catch(e) {
                    setReadme(FALLBACK_README);
                }

            } catch (err) {
                console.error("Critical Fetch Error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if(el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActiveSection(entry.target.id);
            });
        }, { threshold: 0.5 });
        ['home', 'about', 'projects', 'contact'].forEach(id => {
            const el = document.getElementById(id);
            if(el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [loading]);

    return (
        <div className="relative w-full">
            <ThreeBackground />
            <Navbar activeSection={activeSection} scrollTo={scrollTo} />
            <Hero profile={profile} loading={loading} scrollTo={scrollTo} />
            <About profile={profile} readme={readme} stats={stats} />
            <Projects repos={repos} loading={loading} />
            <Contact email="contact@alevoldon.dev" />
        </div>
    );
};


