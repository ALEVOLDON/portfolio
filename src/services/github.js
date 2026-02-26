export const FALLBACK_PROFILE = { name: "Vladimir Rybalsky", bio: "Ex-artist 🎨 & sound designer 🎧 • Frontend 💻 & Blockchain 🤖 • AI 🧠 & Prompt Engineering ⚡ 🔭 • Building digital vibes 🌟, tools 🔧 & ideas 💡", avatar_url: "/avatar.jpg", html_url: "https://github.com/ALEVOLDON", public_repos: 42, followers: 15, created_at: "2022-06-28T10:00:00Z" };
export const FALLBACK_STATS = { totalStars: 156, totalForks: 23, totalSize: 20480, totalWatchers: 45, grade: 'A+', languages: [{ name: 'JavaScript', percent: 45, count: 12 }, { name: 'React', percent: 25, count: 8 }, { name: 'CSS', percent: 15, count: 5 }, { name: 'HTML', percent: 10, count: 3 }, { name: 'Other', percent: 5, count: 2 }] };
export const FALLBACK_REPOS = [
  { id: 1, name: "jukrainian", description: "Learn Ukrainian through gamified exercises. Next.js + Tailwind + PostgreSQL.", html_url: "https://github.com/ALEVOLDON/jukrainian", language: "TypeScript", stargazers_count: 56, forks_count: 12, image: "/projects/jukrainian.png" },
  { id: 2, name: "habit-tracker", description: "Track your daily habits and build streaks. React + Firebase.", html_url: "https://github.com/ALEVOLDON/habit-tracker", language: "React", stargazers_count: 34, forks_count: 5, image: "/projects/habit-tracker.png" },
  { id: 3, name: "acid-synth", description: "WebAudio API synthesizer modeled after TB-303.", html_url: "https://github.com/ALEVOLDON/acid-synth", language: "JavaScript", stargazers_count: 42, forks_count: 8, image: "/projects/acid-synth.png" },
  { id: 4, name: "sc_liked_to_playlist_web", description: "SoundCloud liked tracks to playlist converter Web UI.", html_url: "https://github.com/ALEVOLDON/sc_liked_to_playlist_web", language: "JavaScript", stargazers_count: 15, forks_count: 2, image: "/projects/sc_liked_to_playlist_web.png" },
  { id: 5, name: "Smart-Daw-Landing-React", description: "Landing page for a smart DAW project.", html_url: "https://github.com/ALEVOLDON/Smart-Daw-Landing-React", language: "TypeScript", stargazers_count: 12, forks_count: 1, image: "/projects/Smart-Daw-Landing-React.png" },
  { id: 6, name: "CineBlocker", description: "Browser extension to block movie spoilers.", html_url: "https://github.com/ALEVOLDON/CineBlocker", language: "JavaScript", stargazers_count: 28, forks_count: 4, image: "/projects/CineBlocker.png" }
];
export const FALLBACK_README = "# Hello World\n\nI am a full-stack developer passionate about building excellent software that improves the lives of those around me.\n\n### Skills\n- Front-end: React, Vue, Tailwind CSS\n- Back-end: Node.js, Go, PostgreSQL\n- Tools: Git, Docker, Figma";

const CACHE_KEY = 'portfolio-cache-v1';
const CACHE_TTL_MS = 15 * 60 * 1000;

const PINNED_REPO_NAMES = [
  'jukrainian',
  'habit-tracker',
  'sc_liked_to_playlist_web',
  'acid-synth',
  'Smart-Daw-Landing-React',
  'CineBlocker'
];

const REPO_IMAGE_MAP = {
  'jukrainian': "/projects/jukrainian.png",
  'habit-tracker': "/projects/habit-tracker.png",
  'acid-synth': "/projects/acid-synth.png",
  'sc_liked_to_playlist_web': "/projects/sc_liked_to_playlist_web.png",
  'Smart-Daw-Landing-React': "/projects/Smart-Daw-Landing-React.png",
  'CineBlocker': "/projects/CineBlocker.png"
};

const isRateLimited = (response) => {
  if (!response) return false;
  if (response.status === 429) return true;
  const remaining = response.headers.get('x-ratelimit-remaining');
  return response.status === 403 && remaining === '0';
};

const normalizeProfile = (profileData) => ({
  ...FALLBACK_PROFILE,
  ...(profileData || {}),
  avatar_url: FALLBACK_PROFILE.avatar_url, // always use local avatar
});

const normalizeRepos = (repos) => (
  Array.isArray(repos) && repos.length > 0 ? repos : FALLBACK_REPOS
);

const normalizeStats = (stats) => (
  stats && typeof stats === 'object' ? stats : FALLBACK_STATS
);

const normalizeReadme = (readme) => (
  readme || FALLBACK_README
);

const cleanReadme = (text) => {
  if (!text) return '';
  return text
    .replace(/!\[.*?\]\(.*?github-readme-stats.*?\)/g, '')
    .replace(/!\[.*?\]\(.*?github-profile-trophy.*?\)/g, '')
    .replace(/!\[.*?\]\(.*?github-readme-streak-stats.*?\)/g, '')
    .replace(/!\[.*?\]\(.*?komarev\.com\/ghpvc.*?\)/g, '')
    .replace(/<img.*?src=".*?github-readme-stats.*?".*?>/g, '');
};

const buildStats = (reposForStats) => {
  if (!reposForStats || reposForStats.length === 0) return FALLBACK_STATS;

  const calcStats = { totalStars: 0, totalForks: 0, totalSize: 0, totalWatchers: 0, grade: 'B', languages: [] };
  const langCounts = {};
  let totalLangs = 0;

  reposForStats.forEach((repo) => {
    calcStats.totalStars += repo.stargazers_count || 0;
    calcStats.totalForks += repo.forks_count || 0;
    calcStats.totalSize += repo.size || 0;
    calcStats.totalWatchers += repo.watchers_count || 0;

    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      totalLangs++;
    }
  });

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

  return calcStats;
};

const getCachedData = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

const setCachedData = (payload) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, timestamp: Date.now() }));
  } catch {
    // Ignore storage quota/privacy mode failures.
  }
};

export const getCachedPortfolioData = () => {
  const cached = getCachedData();
  if (!cached) return null;
  return {
    timestamp: cached.timestamp || 0,
    profile: normalizeProfile(cached.profile),
    repos: normalizeRepos(cached.repos),
    stats: normalizeStats(cached.stats),
    readme: normalizeReadme(cached.readme)
  };
};

export const isCachedPortfolioFresh = (cached) => {
  if (!cached?.timestamp) return false;
  return Date.now() - cached.timestamp < CACHE_TTL_MS;
};

export const fetchPortfolioData = async (username, cachedData = null) => {
  let rateLimited = false;
  let profileData = cachedData?.profile || FALLBACK_PROFILE;
  let reposForStats = [];
  let pinnedRepos = [];

  try {
    const profileRes = await fetch(`https://api.github.com/users/${username}`);
    if (profileRes.ok) {
      profileData = await profileRes.json();
    } else if (isRateLimited(profileRes)) {
      rateLimited = true;
    }
  } catch {
    profileData = cachedData?.profile || FALLBACK_PROFILE;
  }

  try {
    const statsRes = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
    if (statsRes.ok) {
      reposForStats = await statsRes.json();
    } else if (isRateLimited(statsRes)) {
      rateLimited = true;
    }
  } catch {
    reposForStats = [];
  }

  try {
    const pinnedRequests = PINNED_REPO_NAMES.map((name) =>
      fetch(`https://api.github.com/repos/${username}/${name}`).then((res) => {
        if (res.ok) return res.json();
        if (isRateLimited(res)) rateLimited = true;
        return null;
      })
    );
    const pinnedResults = await Promise.all(pinnedRequests);
    pinnedRepos = pinnedResults
      .filter((repo) => repo !== null)
      .map((repo) => ({ ...repo, image: REPO_IMAGE_MAP[repo.name] || null }));
  } catch {
    pinnedRepos = [];
  }

  let cleanedReadme = '';
  try {
    const branches = ['main', 'master'];
    for (const branch of branches) {
      const readmeRes = await fetch(`https://raw.githubusercontent.com/${username}/${username}/${branch}/README.md`);
      if (readmeRes.ok) {
        cleanedReadme = cleanReadme(await readmeRes.text());
        break;
      }
      if (isRateLimited(readmeRes)) {
        rateLimited = true;
      }
    }
  } catch {
    cleanedReadme = '';
  }

  const finalData = {
    profile: normalizeProfile(profileData),
    stats: reposForStats.length > 0 ? buildStats(reposForStats) : normalizeStats(cachedData?.stats),
    repos: pinnedRepos.length > 0 ? pinnedRepos : normalizeRepos(cachedData?.repos),
    readme: normalizeReadme(cleanedReadme || cachedData?.readme)
  };

  setCachedData(finalData);
  return { data: finalData, rateLimited };
};
