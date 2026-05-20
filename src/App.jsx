import React, { Suspense, lazy, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import ScrollToTop from './components/ScrollToTop';
import {
  FALLBACK_PROFILE,
  FALLBACK_REPOS,
  FALLBACK_STATS,
  FALLBACK_README,
  getCachedPortfolioData,
  isCachedPortfolioFresh,
  fetchPortfolioData
} from './services/github';

const ThreeBackground = lazy(() => import('./components/ThreeBackground'));

const StaticBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#030106]">
    <div className="background-vignette" />
  </div>
);

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [repos, setRepos] = useState(FALLBACK_REPOS);
  const [readme, setReadme] = useState(FALLBACK_README);
  const loading = false;
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    const scheduleBackground = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 1200));
    const cancelBackground = window.cancelIdleCallback || window.clearTimeout;
    const handle = scheduleBackground(() => setShowBackground(true), { timeout: 1800 });

    return () => cancelBackground(handle);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const applyData = (data) => {
      setProfile(data.profile);
      setRepos(data.repos);
      setStats(data.stats);
      setReadme(data.readme);
    };

    const loadPortfolio = async () => {
      const username = 'ALEVOLDON';
      const cached = getCachedPortfolioData();

      if (cached) {
        applyData(cached);
        if (isCachedPortfolioFresh(cached)) return;
      }

      try {
        const { data, rateLimited } = await fetchPortfolioData(username, cached);
        if (cancelled) return;
        applyData(data);
        if (rateLimited) {
          console.warn('GitHub API rate limit reached. Using cached/fallback data where needed.');
        }
      } catch (error) {
        console.error('Critical Fetch Error', error);
        if (!cancelled && !cached) {
          applyData({
            profile: FALLBACK_PROFILE,
            repos: FALLBACK_REPOS,
            stats: FALLBACK_STATS,
            readme: FALLBACK_README
          });
        }
      }
    };

    loadPortfolio();
    return () => {
      cancelled = true;
    };
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
      entries.forEach((entry) => {
        if (entry.target.tagName.toLowerCase() === 'section' && entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }

        if (entry.target.classList.contains('reveal') && entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.15 });

    ['home', 'about', 'projects', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="relative w-full">
      <Suspense fallback={<StaticBackground />}>
        {showBackground ? <ThreeBackground /> : <StaticBackground />}
      </Suspense>
      <Navbar activeSection={activeSection} scrollTo={scrollTo} />
      <Hero profile={profile} loading={loading} scrollTo={scrollTo} />
      <About profile={profile} readme={readme} stats={stats} />
      <Projects repos={repos} loading={loading} />
      <Contact />
      <ScrollToTop />
    </div>
  );
};

export default App;
