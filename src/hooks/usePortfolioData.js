import { useState, useEffect } from 'react';
import {
  FALLBACK_PROFILE,
  FALLBACK_REPOS,
  FALLBACK_STATS,
  FALLBACK_README,
  getCachedPortfolioData,
  isCachedPortfolioFresh,
  fetchPortfolioData
} from '../services/github';

export const usePortfolioData = () => {
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [repos, setRepos] = useState(FALLBACK_REPOS);
  const [readme, setReadme] = useState(FALLBACK_README);
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [loading, setLoading] = useState(false);

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

      setLoading(true);
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
      } finally {
        if (!cancelled) setLoading(false);
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

  return { profile, repos, stats, readme, loading };
};
