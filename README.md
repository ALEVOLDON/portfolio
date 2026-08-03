<div align="center">
  <h1>🌌 ALEVOLDON Portfolio</h1>

  <p>
    <strong>Production portfolio for <a href="https://alevoldon.com">alevoldon.com</a></strong>
  </p>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
    <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-Black?style=flat-square&logo=three.js&logoColor=white" alt="Three.js" /></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel" alt="Vercel" /></a>
  </p>

  <p>
    <em>A generative portfolio with dual avatar modes, plasma shader / video backgrounds, live GitHub telemetry, and a serverless Telegram contact flow.</em>
  </p>
</div>

<br />

## ✨ Highlights

- ⚡ **React 19 + Vite 7** frontend for lightning-fast performance
- 🎨 **Tailwind CSS v4** styling
- 🌐 **Bilingual System (`EN | RU`)**: Full localization with English as the default landing language, seamless toggle, and structured translation files
- 🌌 **Dual background engine**: live **WebGL plasma shader** (streams, orbs, digital rain) **or** compressed looping **video plate** — switchable in Ambient Engine
- 🎛️ **Background Engine HUD Panel**: floating diagnostics for brightness, drift velocity, palette (**cyber / solar / emerald / void**), quality profiles, and theme modes: **Manual Lock**, **Chrono Sync**, **Matrix Cycle**
- 🧬 **Dual hero avatar (A/B)**: **3D GLB** obsidian-diamond glass head *or* compressed **video head** — same glass frame, gyro HUD rings, and Thought Stream; toggle persists in `localStorage`
- 💭 **Thought Stream**: shared 2D overlay of ambient tech words + multilingual glowing quotes (click or timed) on both avatar modes
- 🔊 **Generative Sound & Eurorack Synth**: Web Audio drone/UI/spatial audio + draggable MODEL CZ-1 modular console with AI preset orchestrator
- 🛠️ **"What I Create" capabilities panel** with terminal-style hover diagnostics
- 🎛️ **Dual-Mode Project Slider**: featured outcomes vs live GitHub telemetry
- 💊 **Holographic Capsule Navbar** + elastic active-link tracker
- 🪐 **3D Planetary Ring Logo** (`ALEVOLDON` / `METAVERSE` orbit text)
- 🎵 **Spotify Soundtrack** slide-out widget
- 🖱️ **Custom cursor** with trail (desktop)
- 🔠 **Typography**: **Outfit** (hero), Orbitron (section/HUD), Space Grotesk (UI), Inter + Fira Code
- 🖼️ **p5.js** generative project thumbnails
- 🐙 **Live GitHub** profile / repos / README with local cache + fallbacks
- 🚀 **Vercel** deploy + serverless contact → **Telegram** + Turnstile
- 📊 **Analytics**: Vercel Analytics + Microsoft Clarity
- 🧠 **Mind Vault** force-directed knowledge graph of vault posts

---

## 🛠️ Tech Stack

| Area | Technology |
| --- | --- |
| **Frontend** | React 19, Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **Typography** | Google Fonts (Outfit, Orbitron, Space Grotesk, Inter, Fira Code) |
| **3D / Visuals** | Three.js (WebGL plasma + avatar), compressed hero/bg video loops, p5.js |
| **Content** | GitHub REST API, `marked` |
| **Icons** | `lucide-react` |
| **Hosting** | Vercel |
| **Contact Delivery** | Vercel Serverless Functions, Telegram Bot API |
| **Anti-spam** | Cloudflare Turnstile |
| **Web Analytics** | Vercel Analytics, Microsoft Clarity |

---

## 🚀 Features

### 🎨 Portfolio UI & UX
- **Bilingual Core (EN | RU)**: English-first bilingual toggle that translates the entire application state on-the-fly without page reloads, maintaining consistent design alignment.
- **What I Create Capabilities Grid**: A custom capabilities container featuring hover-activated diagnostics console logs simulating system terminal metrics, accompanied by subtle synth click highlights.
- **Dual-Mode Project Slider**: Supports switching between curated featured projects with qualitative impact/tech callouts and real-time GitHub telemetry metrics cards.
- **Availability Radar**: Pulsing network radar widget (`AVAILABILITY_RADAR`) built inside the About section indicating active collaboration availability.
- **Interactive Ambient Engine**: HUD for background type (**SHADER** WebGL plasma vs **VIDEO** loop), brightness, drift velocity, palette, quality (`high` / `balanced` / `eco` / `static`), and theme modes: **Manual Lock**, **Chrono Sync** (Solar morning → Emerald afternoon → Cyber evening → Void night), **Matrix Cycle** (~45s auto-rotate with progress bar). Preference stored in `localStorage`.
- **Hero avatar A/B modes**: Toggle **3D GLB** (obsidian/black-diamond `MeshPhysicalMaterial`, cinematic lighting, gyro rings, mouse-tilt) vs **VIDEO** (compressed loop `public/avatar-head.mp4`, same glass frame + shared HUD rings). Selection persists via `heroAvatarMode`.
- **Thought Stream & Quotes**: Shared canvas overlay on both avatar modes — ambient tech words drift upward; click or timer spawns bilingual glowing quotes (no rectangular capsule). Keywords/quotes live in `src/data/quotes.js`.
- **Holographic Capsule Navbar**: Centered glass nav with cyan→purple edges and elastic active-link highlight, synced with UI audio ticks.
- **3D Planetary Ring Logo**: Orbit text logo (`ALEVOLDON` / `METAVERSE`) with hover speed/glow.
- **Spotify Soundtrack Sidebar**: Slide-out glass drawer with embedded playlist widget.
- **Custom Cursor**: Hardware-accelerated dual-layer pointer (desktop only).
- **Staggered scroll reveals** and neomorphic card glows.
- **2030-minimal hero type**: Outfit display font with slow cyan↔purple shimmer on the name.

### 🔊 Interactive Sound Design & Eurorack Synth
- **Generative Audio Engine**: Zero-dependency Web Audio API implementation synthesizing audio on the fly with no asset footprint (0 KB).
- **Dynamic Themed Ambient Drone**: Deep, breathing background drone built from pure sine waves, shifting base notes and LFO rates dynamically to match the visual theme (`cyber`, `solar`, `emerald`, `void`).
- **Tactile UI Sound Effects**: Responsive ticks on button/link hovers, and organic double-pulse click sounds.
- **Spatial Graph Audio**: Hovering over Mind Vault graph nodes calculates their screen position and maps it to a `StereoPannerNode` (left-to-right panning). Posts sound warmer; tags sound like high-pitched chimes.
- **Virtual Eurorack Console (MODEL CZ-1)**: Draggable floating modular synth casing with custom rotary knobs tracking mouse/touch drags to adjust VCO frequency, tuning intervals, VCF cutoff, resonance Q, LFO speed, depth, and Delay FX time/feedback.
- **AI Preset Orchestrator**: Integrated preset matrix inside the modular synth drawer. Provides built-in styles (`Drone`, `Ambient`, `Acid`, `Cyberpunk`) and a text-based procedural input box that generates unique oscillator/filter configurations on the fly based on a text hash.
- **Mobile Responsive Docking**: Docks as a compact bottom sheet on viewport widths $< 640px$, scaling down the knobs to `42px` to prevent screen crowding.

### 🧠 Mind Vault & Knowledge Graph
- **Interactive 2D Canvas Physics Engine**: Features spring attraction (Hooke's Law), charge repulsion (Coulomb's Law with 400x softening to prevent infinite velocity spikes), and center-gravity pull.
- **Micro-Interaction Optimizations**: Employs sticky hover (hysteresis with a 6px buffer) to lock onto nodes without jitter, and nearest-node calculation to prevent overlap confusion.
- **O(1) Performance Scaling**: Utilizes Map key-value lookups inside the requestAnimationFrame loop to bypass O(N) array scans, preserving a stable 60 FPS even with 250+ post nodes.
- **Rich Document Reader**: Features an embedded Markdown parser (`marked` + `dompurify`) rendering fully stylized article views with Lucide metadata blocks and direct opening links to Telegram.
- **Knowledge Controls & Categories**: HUD controls to dynamically restrict post limits, toggle tag visibility on/off, freeze/unfreeze simulation, and recenter/stabilize the layout. Offers quick category filter buttons (`ИИ`, `Дизайн`, `Звук`, `Разработка`) to instantly filter graph nodes by core domain tags.

### 📨 Contact System
- **Inline Form**: A sleek contact form completely replacing `mailto:`.
- **Serverless Forwarding**: Messages are securely forwarded to Telegram via a Vercel Serverless Function.
- **Fast Follow-up**: Optional Telegram handle field from the sender.
- **Bot Protection**: Honeypot field for low-effort bot filtering, backed by Cloudflare Turnstile verification.

### 🛡️ Reliability
- **Local Storage Cache**: Cached GitHub data to ensure instant load times on repeat visits.
- **Fallbacks**: Graceful fallback for profile, stats, repos, and README content in case of GitHub API rate limits.

### 📊 Web Analytics & SEO
- **Privacy-first Analytics**: Lightweight, cookie-less unique visitor and referral tracking via Vercel Analytics.
- **Behavioral Tracking**: Session recordings and visual click/scroll heatmaps via Microsoft Clarity.
- **SEO Readiness**: Canonical link tags, Open Graph meta-tags, standard-compliant `sitemap.xml`, and optimized crawling via `robots.txt`.

### ⚡ Performance & Optimization
- **Dynamic Asset Deferral**: Deferred Google Fonts (`media="print"` onload) and late start of animated backgrounds / WebGL (after first pointer, scroll, or key) for better LCP and Lighthouse scores.
- **Compressed media**: Hero video and plasma plate are pre-encoded for the web (`public/avatar-head.mp4` ~1 MB, `public/bg-plasma.mp4` ~1.5 MB); raw Imagine/Grok dumps are gitignored from the repo root.
- **Lazy API Fetching**: Delayed GitHub profile data fetch until active user interaction, avoiding blockages during critical initial paint ticks.
- **Resource Preloading**: High-priority preloading for the profile avatar (`fetchpriority="high"`) to eliminate LCP (Largest Contentful Paint) delays.
- **Asynchronous Analytics**: Microsoft Clarity tracking script is queued via `requestIdleCallback` to run during idle browser cycles, and Vercel Analytics is integrated directly via lightweight client-side injection.

---

## 📁 Project Structure

```text
ANALYTICS_GUIDE.md
docs/
└── plasma-background-notes.md   # Shader / plasma design notes
public/
├── avatar-head.mp4              # Compressed video avatar loop
├── bg-plasma.mp4                # Compressed video background loop
├── bg-plasma-reference.jpg      # Visual reference for plasma look
├── stylized-head.glb            # 3D head model for GLB avatar mode
└── data/
    └── posts.json               # Mind Vault posts (Obsidian / Telegram sync)
src/
├── components/
│   ├── UI/                      # Navbar, cursor, Ambient Engine, Spotify, etc.
│   ├── Three/                   # PlasmaBackground, VideoBackground, InteractiveAvatar,
│   │                            # VideoAvatar, AvatarHudRings, ThoughtStreamOverlay
│   ├── Synth/                   # Eurorack MODEL CZ-1 console
│   └── Sections/                # Hero, About, Projects, Contact, BrainGraph, …
├── hooks/                       # usePortfolioData
├── data/                        # quotes.js, translations.js
├── services/                    # AudioService, GitHub client
├── App.jsx
├── index.css
└── main.jsx
api/
└── contact.js                   # Serverless Telegram contact
```

---

## 💻 Local Development

### Prerequisites
- **Node.js** (v20+ recommended)
- **npm**

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`*

3. **Production Build**
   ```bash
   npm run build
   ```

---

## 🔐 Environment Variables

The site works out of the box for viewing, but the **contact flow** and **spam protection** require some environment configuration.

### Frontend (`.env`)
Create a local `.env` file in the root directory:
```env
VITE_CONTACT_ENDPOINT=/api/contact
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

### Vercel Serverless Functions
Set the following variables in your Vercel Environment settings:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_key
```

---

## 🌐 Vercel Deployment

This project is configured for Vercel deployment. Vercel automatically detects the Vite framework and runs the build command.

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **API Routes**: Configured automatically via the `api/` folder

**Typical Deploy Flow:**
```bash
git add .
git commit -m "Update portfolio"
git push origin main
```
*Vercel will automatically trigger a new deployment from the `main` branch on every push.*

---

## 📝 Notes & License

- **Rate Limits**: GitHub API usage is anonymous by default. The application gracefully handles rate limits by serving local fallback data to keep the UI intact.
- **Turnstile**: Enforcement is active only when the relevant site and secret keys are configured.
- **License**: Maintained as a personal portfolio project.

<div align="center">
  <br/>
  <sub>Built with ❤️ by Alevoldon</sub>
</div>
