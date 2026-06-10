import React, { Suspense, lazy, useState, useEffect } from 'react';
import CustomCursor from './components/CustomCursor';
import BackgroundControls from './components/BackgroundControls';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhatICreate from './components/WhatICreate';
import About from './components/About';
import Projects from './components/Projects';
import BrainGraph from './components/BrainGraph';
import Contact from './components/Contact';
import ScrollToTop from './components/ScrollToTop';
import SpotifyPlayer from './components/SpotifyPlayer';
import AudioService from './services/AudioService';
import ModularSynth from './components/ModularSynth';
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
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-cyber-black">
    <div className="background-vignette" />
  </div>
);

const themeOrder = ['solar', 'emerald', 'cyber', 'void'];

const getChronoTheme = (hour) => {
  if (hour >= 6 && hour < 12) return 'solar';     // Morning (6 AM - 12 PM)
  if (hour >= 12 && hour < 18) return 'emerald';  // Afternoon (12 PM - 6 PM)
  if (hour >= 18 && hour < 24) return 'cyber';    // Evening (6 PM - 12 AM)
  return 'void';                                  // Night (12 AM - 6 AM)
};

const App = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [language, setLanguage] = useState('en');
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [repos, setRepos] = useState(FALLBACK_REPOS);
  const [readme, setReadme] = useState(FALLBACK_README);
  const loading = false;
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [showBackground, setShowBackground] = useState(false);
  const [bgConfig, setBgConfig] = useState(() => {
    const storedTheme = localStorage.getItem('theme') || 'solar';
    const storedBrightness = localStorage.getItem('themeBrightness') ? parseFloat(localStorage.getItem('themeBrightness')) : 1.0;
    const storedSpeed = localStorage.getItem('themeSpeed') ? parseFloat(localStorage.getItem('themeSpeed')) : 1.0;
    return {
      brightness: storedBrightness,
      speed: storedSpeed,
      theme: storedTheme
    };
  });
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'manual';
  });
  const [cycleProgress, setCycleProgress] = useState(0);
  const [showSynth, setShowSynth] = useState(false);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('theme', bgConfig.theme);
  }, [bgConfig.theme]);

  useEffect(() => {
    localStorage.setItem('themeBrightness', bgConfig.brightness);
  }, [bgConfig.brightness]);

  useEffect(() => {
    localStorage.setItem('themeSpeed', bgConfig.speed);
  }, [bgConfig.speed]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Chrono Sync logic
  useEffect(() => {
    if (themeMode !== 'chrono') return;

    const updateChronoTheme = () => {
      const hour = new Date().getHours();
      const currentTheme = getChronoTheme(hour);
      if (bgConfig.theme !== currentTheme) {
        setBgConfig(prev => ({ ...prev, theme: currentTheme }));
      }
    };

    updateChronoTheme();
    const interval = setInterval(updateChronoTheme, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [themeMode, bgConfig.theme]);

  // Matrix Cycle logic
  useEffect(() => {
    if (themeMode !== 'cycle') {
      setCycleProgress(0);
      return;
    }

    const intervalTime = 100; // Increment every 100ms for smooth progress bar animation
    const duration = 45000; // 45s
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setCycleProgress((prev) => {
        if (prev >= 100) {
          setBgConfig((prevBg) => {
            const currentIndex = themeOrder.indexOf(prevBg.theme);
            const nextIndex = (currentIndex + 1) % themeOrder.length;
            return { ...prevBg, theme: themeOrder[nextIndex] };
          });
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [themeMode]);

  useEffect(() => {
    const enableBackground = () => setShowBackground(true);

    window.addEventListener('pointermove', enableBackground, { once: true, passive: true });
    window.addEventListener('scroll', enableBackground, { once: true, passive: true });
    window.addEventListener('keydown', enableBackground, { once: true });

    return () => {
      window.removeEventListener('pointermove', enableBackground);
      window.removeEventListener('scroll', enableBackground);
      window.removeEventListener('keydown', enableBackground);
    };
  }, []);

  // Setup global interaction listeners for AudioContext activation and click sounds
  useEffect(() => {
    AudioService.setupInteractionListeners();

    const handleGlobalClick = () => {
      AudioService.playClick();
    };

    window.addEventListener('click', handleGlobalClick);

    return () => {
      AudioService.cleanupInteractionListeners();
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Sync theme changes with the audio service and document body class
  useEffect(() => {
    AudioService.setTheme(bgConfig.theme);
    
    const body = document.body;
    body.className = body.className.replace(/\btheme-\S+/g, '');
    body.classList.add(`theme-${bgConfig.theme}`);
  }, [bgConfig.theme]);

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

    const scheduleSync = () => {
      if (cancelled) return;
      loadPortfolio();
    };

    window.addEventListener('pointermove', scheduleSync, { once: true, passive: true });
    window.addEventListener('scroll', scheduleSync, { once: true, passive: true });
    window.addEventListener('keydown', scheduleSync, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('pointermove', scheduleSync);
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('keydown', scheduleSync);
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

    ['home', 'create', 'projects', 'about', 'brain', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className={`relative w-full theme-${bgConfig.theme}`}>
      <CustomCursor />
      <BackgroundControls 
        bgConfig={bgConfig} 
        setBgConfig={setBgConfig} 
        setShowSynth={setShowSynth} 
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        cycleProgress={cycleProgress}
      />
      {showSynth && <ModularSynth onClose={() => setShowSynth(false)} />}
      <Suspense fallback={<StaticBackground />}>
        {showBackground ? <ThreeBackground {...bgConfig} /> : <StaticBackground />}
      </Suspense>
      <div className="cyber-grid-overlay" />
      <Navbar activeSection={activeSection} scrollTo={scrollTo} language={language} setLanguage={setLanguage} />
      <SpotifyPlayer />
      <main>
        <Hero theme={bgConfig.theme} profile={profile} loading={loading} scrollTo={scrollTo} language={language} />
        <WhatICreate language={language} />
        <Projects repos={repos} loading={loading} language={language} />
        <About profile={profile} readme={readme} stats={stats} language={language} />
        <BrainGraph theme={bgConfig.theme} language={language} />
        <Contact language={language} />
      </main>
      <ScrollToTop />
    </div>
  );
};

export default App;
