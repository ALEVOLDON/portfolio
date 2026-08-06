import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import CustomCursor from './components/UI/CustomCursor';
import BackgroundControls from './components/UI/BackgroundControls';
import Navbar from './components/UI/Navbar';
import Hero from './components/Sections/Hero';
import WhatICreate from './components/Sections/WhatICreate';
import About from './components/Sections/About';
import Projects from './components/Sections/Projects';
import DeferredBrainGraph from './components/Sections/DeferredBrainGraph';
import Contact from './components/Sections/Contact';
import ScrollToTop from './components/UI/ScrollToTop';
import SpotifyPlayer from './components/UI/SpotifyPlayer';
import AudioService from './services/AudioService';
import ModularSynth from './components/Synth/ModularSynth';
import { translations } from './data/translations';
import { usePortfolioData } from './hooks/usePortfolioData';

const PlasmaBackground = lazy(() => import('./components/Three/PlasmaBackground'));
const VideoBackground = lazy(() => import('./components/Three/VideoBackground'));

const StaticBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-cyber-black">
    <div className="background-vignette" />
  </div>
);

const BG_MODE_KEY = 'bgMode';
const AVATAR_MODE_KEY = 'heroAvatarMode';

const themeOrder = ['solar', 'emerald', 'cyber', 'void'];

const getChronoTheme = (hour) => {
  if (hour >= 6 && hour < 12) return 'solar';     // Morning (6 AM - 12 PM)
  if (hour >= 12 && hour < 18) return 'emerald';  // Afternoon (12 PM - 6 PM)
  if (hour >= 18 && hour < 24) return 'cyber';    // Evening (6 PM - 12 AM)
  return 'void';                                  // Night (12 AM - 6 AM)
};

const App = () => {
  const { profile, repos, stats, readme, loading } = usePortfolioData();
  const [activeSection, setActiveSection] = useState('home');
  const [language, setLanguage] = useState('en');
  const [showBackground, setShowBackground] = useState(true);
  const [bgMode, setBgMode] = useState(() => {
    try {
      return localStorage.getItem(BG_MODE_KEY) || 'video';
    } catch {
      return 'video';
    }
  });
  const [avatarMode, setAvatarMode] = useState(() => {
    try {
      return localStorage.getItem(AVATAR_MODE_KEY) || 'video';
    } catch {
      return 'video';
    }
  });
  const [bgConfig, setBgConfig] = useState(() => {
    const storedTheme = localStorage.getItem('theme') || 'cyber';
    const storedBrightness = localStorage.getItem('themeBrightness') ? parseFloat(localStorage.getItem('themeBrightness')) : 1.0;
    const storedSpeed = localStorage.getItem('themeSpeed') ? parseFloat(localStorage.getItem('themeSpeed')) : 1.0;
    const storedQuality = localStorage.getItem('themeQuality') || 'balanced';
    return {
      brightness: storedBrightness,
      speed: storedSpeed,
      theme: storedTheme,
      quality: storedQuality
    };
  });
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'manual';
  });
  const [cycleProgress, setCycleProgress] = useState(0);
  const [showSynth, setShowSynth] = useState(false);

  const isFirstThemeRender = useRef(true);
  const prevThemeRef = useRef(bgConfig.theme);

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
    localStorage.setItem('themeQuality', bgConfig.quality);
  }, [bgConfig.quality]);

  useEffect(() => {
    try {
      localStorage.setItem(BG_MODE_KEY, bgMode);
    } catch {
      /* ignore */
    }
  }, [bgMode]);

  useEffect(() => {
    try {
      localStorage.setItem(AVATAR_MODE_KEY, avatarMode);
    } catch {
      /* ignore */
    }
  }, [avatarMode]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // When theme changes:
  // - Cyber theme: switch background mode to 'video' and avatar mode to 'video'
  // - Other themes (solar, emerald, void): switch background mode to 'shader' and avatar mode to '3d'
  useEffect(() => {
    if (bgConfig.theme === 'cyber') {
      setBgMode('video');
      setAvatarMode('video');
    } else {
      setBgMode('shader');
      setAvatarMode('3d');
    }
  }, [bgConfig.theme]);

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

  // Removed pointermove/scroll listeners so background loads immediately

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
    const meta = translations[language].meta;
    if (meta) {
      document.title = meta.title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute('content', meta.description);
    }
  }, [language]);

  useEffect(() => {
    AudioService.setTheme(bgConfig.theme);
    
    const body = document.body;
    body.className = body.className.replace(/\btheme-\S+/g, '');
    body.classList.add(`theme-${bgConfig.theme}`);
  }, [bgConfig.theme]);



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
        bgMode={bgMode}
        setBgMode={setBgMode}
        setShowSynth={setShowSynth} 
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        cycleProgress={cycleProgress}
        language={language}
      />
      {showSynth && <ModularSynth onClose={() => setShowSynth(false)} />}
      <Suspense fallback={<StaticBackground />}>
        {showBackground ? (
          bgMode === 'video' ? (
            <VideoBackground brightness={bgConfig.brightness} />
          ) : (
            <PlasmaBackground key={bgConfig.theme} {...bgConfig} />
          )
        ) : (
          <StaticBackground />
        )}
      </Suspense>
      <div className="cyber-grid-overlay" />
      <Navbar activeSection={activeSection} scrollTo={scrollTo} language={language} setLanguage={setLanguage} />
      <SpotifyPlayer language={language} />
      <main>
        <Hero theme={bgConfig.theme} profile={profile} loading={loading} scrollTo={scrollTo} language={language} avatarMode={avatarMode} setAvatarMode={setAvatarMode} />
        <WhatICreate language={language} />
        <Projects theme={bgConfig.theme} repos={repos} loading={loading} language={language} />
        <About profile={profile} readme={readme} stats={stats} language={language} />
        <DeferredBrainGraph theme={bgConfig.theme} language={language} />
        <Contact language={language} />
      </main>
      <ScrollToTop />
    </div>
  );
};

export default App;
