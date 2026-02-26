import React, { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import ScrollToTop from './components/ScrollToTop';

// Fallback DATA from old index.html
const FALLBACK_PROFILE = { name: "ALEVOLDON", bio: "Building the future of the web.", avatar_url: "https://avatars.githubusercontent.com/u/108390197?v=4", html_url: "https://github.com/ALEVOLDON", public_repos: 42, followers: 15, created_at: "2022-06-28T10:00:00Z" };
const FALLBACK_STATS = { totalStars: 156, totalForks: 23, totalSize: 20480, totalWatchers: 45, grade: 'A+', languages: [{ name: 'JavaScript', percent: 45, count: 12 }, { name: 'React', percent: 25, count: 8 }, { name: 'CSS', percent: 15, count: 5 }, { name: 'HTML', percent: 10, count: 3 }, { name: 'Other', percent: 5, count: 2 }] };
const FALLBACK_REPOS = [
  { id: 1, name: "jukrainian", description: "Learn Ukrainian through gamified exercises. Next.js + Tailwind + PostgreSQL.", html_url: "https://github.com/ALEVOLDON/jukrainian", language: "TypeScript", stargazers_count: 56, forks_count: 12, image: "/projects/jukrainian.png" },
  { id: 2, name: "habit-tracker", description: "Track your daily habits and build streaks. React + Firebase.", html_url: "https://github.com/ALEVOLDON/habit-tracker", language: "React", stargazers_count: 34, forks_count: 5, image: "/projects/habit-tracker.png" },
  { id: 3, name: "acid-synth", description: "WebAudio API synthesizer modeled after TB-303.", html_url: "https://github.com/ALEVOLDON/acid-synth", language: "JavaScript", stargazers_count: 42, forks_count: 8, image: "/projects/acid-synth.png" },
  { id: 4, name: "sc_liked_to_playlist_web", description: "SoundCloud liked tracks to playlist converter Web UI.", html_url: "https://github.com/ALEVOLDON/sc_liked_to_playlist_web", language: "JavaScript", stargazers_count: 15, forks_count: 2, image: "/projects/sc_liked_to_playlist_web.png" },
  { id: 5, name: "Smart-Daw-Landing-React", description: "Landing page for a smart DAW project.", html_url: "https://github.com/ALEVOLDON/Smart-Daw-Landing-React", language: "TypeScript", stargazers_count: 12, forks_count: 1, image: "/projects/Smart-Daw-Landing-React.png" },
  { id: 6, name: "CineBlocker", description: "Browser extension to block movie spoilers.", html_url: "https://github.com/ALEVOLDON/CineBlocker", language: "JavaScript", stargazers_count: 28, forks_count: 4, image: "/projects/CineBlocker.png" }
];
const FALLBACK_README = "# Hello World\n\nI am a full-stack developer passionate about building excellent software that improves the lives of those around me.\n\n### Skills\n- Front-end: React, Vue, Tailwind CSS\n- Back-end: Node.js, Go, PostgreSQL\n- Tools: Git, Docker, Figma";

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
        // 1. Profile
        let profileData;
        try {
          const res = await fetch(`https://api.github.com/users/${username}`);
          if (res.ok) profileData = await res.json();
          else throw new Error("Profile API fail");
        } catch {
          console.warn("Profile fallback");
          profileData = FALLBACK_PROFILE;
        }

        // Ensure ALL properties are copied over if missing from API partial response
        if (!profileData.name) profileData.name = FALLBACK_PROFILE.name;
        if (!profileData.bio) profileData.bio = FALLBACK_PROFILE.bio;
        if (!profileData.avatar_url) profileData.avatar_url = FALLBACK_PROFILE.avatar_url;
        if (!profileData.html_url) profileData.html_url = FALLBACK_PROFILE.html_url;

        setProfile(profileData);
        let allReposForStats = [];
        try {
          const res = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
          if (res.ok) {
            allReposForStats = await res.json();
          } else {
            allReposForStats = [];
          }
        } catch {
          console.warn("Stats repo fallback");
          allReposForStats = [];
        }

        // Calculate Stats
        const calcStats = { totalStars: 0, totalForks: 0, totalSize: 0, totalWatchers: 0, grade: 'B', languages: [] };
        const langCounts = {};
        let totalLangs = 0;

        if (allReposForStats.length > 0) {
          allReposForStats.forEach(repo => {
            calcStats.totalStars += repo.stargazers_count;
            calcStats.totalForks += repo.forks_count;
            calcStats.totalSize += repo.size; // in KB
            calcStats.totalWatchers += repo.watchers_count;

            if (repo.language) {
              langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
              totalLangs++;
            }
          });

          // Calculate Grade (Mock Logic based on stars)
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
          // USE FALLBACK IF API FAILED
          calcStats.totalStars = FALLBACK_STATS.totalStars;
          calcStats.totalForks = FALLBACK_STATS.totalForks;
          calcStats.totalSize = FALLBACK_STATS.totalSize;
          calcStats.totalWatchers = FALLBACK_STATS.totalWatchers;
          calcStats.grade = FALLBACK_STATS.grade;
          calcStats.languages = FALLBACK_STATS.languages;
        }

        setStats(calcStats);

        // 3. FETCH SPECIFIC PINNED PROJECTS FOR DISPLAY
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
          // Map images to fetched repos dynamically
          const imageMap = {
            'jukrainian': "/projects/jukrainian.png",
            'habit-tracker': "/projects/habit-tracker.png",
            'acid-synth': "/projects/acid-synth.png",
            'sc_liked_to_playlist_web': "/projects/sc_liked_to_playlist_web.png",
            'Smart-Daw-Landing-React': "/projects/Smart-Daw-Landing-React.png",
            'CineBlocker': "/projects/CineBlocker.png"
          };

          pinnedRepos = results.filter(r => r !== null).map(repo => ({
            ...repo,
            image: imageMap[repo.name] || null
          }));
        } catch {
          console.warn("Pinned repos fetch failed");
        }

        setRepos(pinnedRepos.length > 0 ? pinnedRepos : FALLBACK_REPOS);

        // 4. Readme
        try {
          let text = "";
          const branches = ['main', 'master'];
          for (let branch of branches) {
            const res = await fetch(`https://raw.githubusercontent.com/${username}/${username}/${branch}/README.md`);
            if (res.ok) {
              text = await res.text();
              break;
            }
          }
          if (text) {
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
        } catch {
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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Section tracking
        if (entry.target.tagName.toLowerCase() === 'section' && entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }

        // Reveal animation tracking
        if (entry.target.classList.contains('reveal')) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        }
      });
    }, { threshold: 0.15 });

    // Observe sections for navbar
    ['home', 'about', 'projects', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Observe reveal elements
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

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
      <ScrollToTop />
    </div>
  );
};

export default App;
