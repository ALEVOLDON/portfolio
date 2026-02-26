# ALEVOLDON — Personal Portfolio

A cyberpunk-styled developer portfolio built with React + Vite. Fetches live data from GitHub API with intelligent caching and graceful fallback.

🌐 **Live:** [alevoldon.com](https://alevoldon.com)

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS v4 |
| 3D Background | Three.js |
| Generative Thumbnails | p5.js |
| Markdown Rendering | marked |
| Icons | lucide-react |
| Hosting | Netlify |

## Features

- **Three.js particle background** — interactive, reacts to mouse movement
- **GitHub API integration** — live profile stats, repos, README
- **Smart caching** — localStorage cache with 15-min TTL, instant load on repeat visits
- **Graceful fallback** — local avatar + real profile data shown even when GitHub API is rate-limited
- **Generative project thumbnails** — unique p5.js particle sketch per repo, seeded by repo name
- **Scroll reveal animations** — IntersectionObserver-based
- **Responsive** — mobile menu with backdrop blur

## Project Structure

```
src/
├── components/
│   ├── ThreeBackground.jsx   # Three.js particle scene
│   ├── Navbar.jsx            # Fixed nav with mobile menu
│   ├── Hero.jsx              # Landing section
│   ├── About.jsx             # GitHub stats + README
│   ├── Projects.jsx          # Repo cards with language filter
│   ├── Contact.jsx           # Email + social links
│   ├── GenerativeThumbnail.jsx # p5.js canvas per project card
│   ├── ScrollToTop.jsx       # Floating scroll button
│   └── Icon.jsx              # lucide-react wrapper
├── services/
│   └── github.js             # API fetching, caching, fallback logic
├── App.jsx
├── main.jsx
└── index.css
public/
└── avatar.jpg                # Local avatar (always loads, no API needed)
```

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy

Netlify auto-deploys on push to `main`. Config in `netlify.toml`:
- Build command: `npm run build`
- Publish dir: `dist`
- SPA redirects: all routes → `index.html`

```bash
git add .
git commit -m "your message"
git push origin main
```

## GitHub API & Rate Limits

The app hits three GitHub API endpoints on load:
- `GET /users/ALEVOLDON` — profile
- `GET /users/ALEVOLDON/repos` — all repos for stats
- `GET /repos/ALEVOLDON/{name}` × 6 — pinned repos

Anonymous rate limit is **60 requests/hour**. When limited, the app automatically falls back to:
- Local avatar (`/avatar.jpg`)
- Hardcoded profile data (real name, bio)
- Cached data from localStorage if available

---

© 2025 Vladimir Rybalsky (ALEVOLDON)
