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
    <em>A sleek, generative portfolio with live GitHub data integration, Three.js backgrounds, and a serverless Telegram contact flow.</em>
  </p>
</div>

<br />

## ✨ Highlights

- ⚡ **React 19 + Vite 7** frontend for lightning-fast performance
- 🎨 **Tailwind CSS v4** styling
- 🌐 **Bilingual System (`EN | RU`)**: Full localization with English as the default landing language, offering a seamless toggle and structured translation files.
- 🌌 **Three.js** animated, particle-based background
- 🎛️ **Background Engine HUD Panel**: Floating diagnostics panel allowing users to adjust brightness, particle drift velocity, and morph colors between Cyber, Solar, Emerald, and Void themes over smooth LERP transitions.
- 🔊 **Generative Sound & Eurorack Synth**: Real-time sound engine using native Web Audio API (ambient drone, UI ticks/clicks, and spatial graph audio) paired with a draggable virtual Eurorack Modular Synth console ("MODEL CZ-1") with custom rotary knobs, plus an **AI Preset Orchestrator** supporting custom presets (`Drone`, `Ambient`, `Acid`, etc.) and procedural text hashing.
- 🛠️ **"What I Create" capabilities panel**: Interactive capability grid featuring real-time diagnostic terminal log effects on hover and sound tick integration.
- 🎛️ **Dual-Mode Project Slider**: Toggle between high-impact featured projects (highlighting key outcomes) and live GitHub telemetry.
- 📡 **Availability Radar**: Pulsing `AVAILABILITY_RADAR` component representing real-time collaboration status.
- 💊 **Holographic Capsule Navbar**: Centered, floating glassmorphic nav bar with sub-pixel gradient borders and an elastic background highlight tracker that slides behind active links.
- 🪐 **3D Planetary Ring Logo**: An interactive 3D spinning text logo representing a planetary orbit, displaying alternating text (like `ALEVOLDON` and `METAVERSE`) wrapped in 3D coordinates.
- 🎵 **Spotify Soundtrack Sidebar Widget**: Global slide-out glass drawer containing a streaming Spotify playlist, triggered by an animated floating player button on the screen edge.
- 🖱️ **Hardware-Accelerated Custom Cursor**: Dual-layer pointer with trail effects, interactive scaling, and hover mixing modes.
- 🔠 **Futuristic Typography**: Customized Google Fonts configuration utilizing Orbitron for titles/technical HUD displays and Space Grotesk for labels/interactive controls.
- 🎬 **Cubic-Bezier Scroll Reveals**: Responsive slide-ins, staggered grid reveals, and neomorphic hover glows on metrics cards.
- 🖼️ **p5.js** generative thumbnails for project cards
- 🐙 **Live GitHub** profile, repository, and README data fetching
- 🗄️ **Local caching** and fallback data for GitHub API resilience
- 🚀 **Vercel deployment** with a serverless contact endpoint
- 📱 **Telegram notifications** for incoming contact requests
- 🤖 **Cloudflare Turnstile** spam protection
- 📊 **Modern Analytics**: Vercel Analytics (privacy-focused) & Microsoft Clarity (heatmaps & session recordings)
- 🔍 **SEO Optimization**: Integrated robots.txt, sitemap.xml, and canonical meta configuration
- ⚡ **Lighthouse Performance Optimizations**: Lazy-loaded WebGL background, deferred third-party tracking, and deferred font loading for optimal Core Web Vitals.
- 🧬 **Volumetric 3D Cyber-Hologram Avatar**: Interactive Three.js WebGL avatar rendering a custom 3D head model (`stylized-head.glb`) with a dark cyber-glass core, a dynamic downsampled holographic particle cloud, shifting cyber-cyan/purple gradient colors, rotating gyroscopic orbital HUD rings, and cursor-tilt tracking.
- 🧠 **Mind Vault & Knowledge Graph**: Force-directed 2D canvas visualization of personal posts, featuring search, zoom/pan controls, inline reader, and **category filter tags** (`ИИ`, `Дизайн`, `Звук`, `Разработка`) for instant graph trimming.

---

## 🛠️ Tech Stack

| Area | Technology |
| --- | --- |
| **Frontend** | React 19, Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **Typography** | Google Fonts (Orbitron, Space Grotesk, Inter, Fira Code) |
| **3D / Visuals** | Three.js (WebGL), p5.js |
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
- **Interactive Ambient Engine**: Control panel widget for real-time background shader updates. Adjust brightness (0.2x to 2.0x), time velocity (0.0x to 2.5x to pause/speed drift), and smoothly transition color presets in the GPU loop.
- **Holographic Capsule Navbar**: Centered, floating glassmorphic nav bar with sub-pixel gradient borders (cyan-to-purple) using CSS masking techniques. Features an elastic background highlight tracker that slides behind active links and is synced with Web Audio tick triggers on hover.
- **3D Planetary Ring Logo**: Custom 3D spinning text logo representing a planetary orbit, displaying alternating text (like `ALEVOLDON` and `METAVERSE`) wrapped in 3D coordinates. Speeds up and glows brighter on hover.
- **Spotify Soundtrack Sidebar Widget**: Global slide-out glass drawer containing a streaming Spotify playlist, triggered by an animated floating player button on the screen edge. Includes a spinning record icon, pulsing neon indicator, and closed overlay click handler.
- **Lag-Free Cursor Trails**: Hardware-accelerated custom cursor dot and trail ring that rescales on hover and auto-disables on touchscreen devices.
- **Staggered Animations**: Directional scroll reveals driven by CSS cubic-bezier transitions as page sections come into view.
- **Neomorphic Glows**: Custom interactive neon shadows that project from GitHub stats cards on hover.
- **Modern Layout**: Responsive viewport grid with sticky navigation and automatic highlight observers.
- **Volumetric 3D Avatar Hologram**: Renders a custom 3D head model with a hybrid material stack consisting of a dark semi-transparent glass base (acting as depth occlusion) and a downsampled glowing holographic point cloud (reducing vertex density for a matrix-like effect), complete with three independent gyroscopic scanner rings.

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
- **Dynamic Asset Deferral**: Deferred loading of Google Fonts (`media="print"` onload technique) and late initialization of the Three.js WebGL canvas (rendered only after first user movement, scroll, or keystroke) to achieve a near-perfect Google Lighthouse score.
- **Lazy API Fetching**: Delayed GitHub profile data fetch until active user interaction, avoiding blockages during critical initial paint ticks.
- **Resource Preloading**: High-priority preloading for the profile avatar (`fetchpriority="high"`) to eliminate LCP (Largest Contentful Paint) delays.
- **Asynchronous Analytics**: Microsoft Clarity tracking script is queued via `requestIdleCallback` to run during idle browser cycles, and Vercel Analytics is integrated directly via lightweight client-side injection.

---

## 📁 Project Structure

```text
ANALYTICS_GUIDE.md       # Detailed guide on tracking website stats
public/
└── data/
    └── posts.json       # Compiled static database of Obsidian vault posts
src/
├── components/          # UI components
│   ├── About.jsx
│   ├── BackgroundControls.jsx # HUD widget for background settings
│   ├── BrainGraph.jsx         # Obsidian-style interactive force-directed canvas graph
│   ├── Contact.jsx
│   ├── CustomCursor.jsx       # Smooth mouse trail pointer
│   ├── GenerativeThumbnail.jsx
│   ├── Hero.jsx
│   ├── Icon.jsx
│   ├── InteractiveAvatar.jsx  # 3D WebGL face-scan hologram
│   ├── ModularSynth.jsx       # Draggable Eurorack modular synth widget
│   ├── Navbar.jsx
│   ├── Projects.jsx
│   ├── RotaryKnob.jsx         # Mouse/touch vertical drag dial
│   ├── ScrollToTop.jsx
│   ├── SpotifyPlayer.jsx      # Global slide-out Spotify player widget
│   └── ThreeBackground.jsx    # WebGL background and particle shaders
├── services/            # API integrations
│   ├── AudioService.js        # Web Audio API synthesizers & delay loop
│   └── github.js        # GitHub data fetching & caching
├── App.jsx              # Main application layout
├── index.css            # Tailwind directives and global styles
└── main.jsx             # React entry point

api/
└── contact.js           # Serverless function for Telegram messaging
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
