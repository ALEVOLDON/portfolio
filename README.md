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
    <a href="https://netlify.com/"><img src="https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=flat-square&logo=netlify&logoColor=white" alt="Netlify" /></a>
  </p>

  <p>
    <em>A sleek, generative portfolio with live GitHub data integration, Three.js backgrounds, and a serverless Telegram contact flow.</em>
  </p>
</div>

<br />

## ✨ Highlights

- ⚡ **React 19 + Vite 7** frontend for lightning-fast performance
- 🎨 **Tailwind CSS v4** styling
- 🌌 **Three.js** animated, particle-based background
- 🖼️ **p5.js** generative thumbnails for project cards
- 🐙 **Live GitHub** profile, repository, and README data fetching
- 🗄️ **Local caching** and fallback data for GitHub API resilience
- 🚀 **Netlify deployment** with a serverless contact endpoint
- 📱 **Telegram notifications** for incoming contact requests
- 🤖 **Cloudflare Turnstile** spam protection

---

## 🛠️ Tech Stack

| Area | Technology |
| --- | --- |
| **Frontend** | React 19, Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **3D / Visuals** | Three.js, p5.js |
| **Content** | GitHub REST API, `marked` |
| **Icons** | `lucide-react` |
| **Hosting** | Netlify |
| **Contact Delivery** | Netlify Functions, Telegram Bot API |
| **Anti-spam** | Cloudflare Turnstile |

---

## 🚀 Features

### 🎨 Portfolio UI
- **Generative Background**: Animated hero and particle-based background via Three.js.
- **Dynamic Content**: GitHub-powered profile and project sections. READMEs are dynamically rendered from GitHub content.
- **Smart Filtering**: Language-aware project filtering.
- **Smooth UX**: Scroll reveal transitions and fully responsive navigation.

### 📨 Contact System
- **Inline Form**: A sleek contact form completely replacing `mailto:`.
- **Serverless Forwarding**: Messages are securely forwarded to Telegram via a Netlify Function.
- **Fast Follow-up**: Optional Telegram handle field from the sender.
- **Bot Protection**: Honeypot field for low-effort bot filtering, backed by Cloudflare Turnstile verification.

### 🛡️ Reliability
- **Local Storage Cache**: Cached GitHub data to ensure instant load times on repeat visits.
- **Fallbacks**: Graceful fallback for profile, stats, repos, and README content in case of GitHub API rate limits.

---

## 📁 Project Structure

```text
src/
├── components/          # UI components
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── GenerativeThumbnail.jsx
│   ├── Hero.jsx
│   ├── Icon.jsx
│   ├── Navbar.jsx
│   ├── Projects.jsx
│   ├── ScrollToTop.jsx
│   └── ThreeBackground.jsx
├── services/            # API integrations
│   └── github.js        # GitHub data fetching & caching
├── App.jsx              # Main application layout
├── index.css            # Tailwind directives and global styles
└── main.jsx             # React entry point

netlify/
└── functions/
    └── contact.js       # Serverless function for Telegram messaging
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
VITE_CONTACT_ENDPOINT=/.netlify/functions/contact
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

### Netlify Functions
Set the following variables in your Netlify Environment settings:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_key
```

---

## 🌐 Netlify Deployment

This project is pre-configured for Netlify via [`netlify.toml`](./netlify.toml).

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`
- **Routing**: SPA redirect (all routes to `index.html`)

**Typical Deploy Flow:**
```bash
git add .
git commit -m "Update portfolio"
git push origin main
```
*Netlify will automatically trigger a new deployment from the `main` branch.*

---

## 📝 Notes & License

- **Rate Limits**: GitHub API usage is anonymous by default. The application gracefully handles rate limits by serving local fallback data to keep the UI intact.
- **Turnstile**: Enforcement is active only when the relevant site and secret keys are configured.
- **License**: Maintained as a personal portfolio project.

<div align="center">
  <br/>
  <sub>Built with ❤️ by Alevoldon</sub>
</div>
