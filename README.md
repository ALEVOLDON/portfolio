# ALEVOLDON Portfolio

Production portfolio for [alevoldon.com](https://alevoldon.com), built with React and Vite.

The project combines a custom visual style, live GitHub-driven content, and a production-ready contact flow powered by Netlify Functions, Telegram Bot API, and Cloudflare Turnstile.

## Highlights

- React 19 + Vite 7 frontend
- Tailwind CSS v4 styling
- Three.js animated background
- p5.js generative thumbnails for project cards
- Live GitHub profile, repository, and README data
- Local caching and fallback data for GitHub API resilience
- Netlify deployment with serverless contact endpoint
- Telegram notifications for incoming contact requests
- Optional Telegram username field for fast follow-up
- Cloudflare Turnstile spam protection

## Live Site

- Production: [https://alevoldon.com/](https://alevoldon.com/)

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite 7 |
| Styling | Tailwind CSS v4 |
| 3D / Visuals | Three.js, p5.js |
| Content | GitHub REST API, marked |
| Icons | lucide-react |
| Hosting | Netlify |
| Contact Delivery | Netlify Functions, Telegram Bot API |
| Anti-spam | Cloudflare Turnstile |

## Features

### Portfolio UI

- Animated hero and particle-based background
- GitHub-powered profile and project sections
- README rendering from GitHub content
- Language-aware project filtering
- Scroll reveal transitions and responsive navigation

### Contact System

- Inline contact form instead of `mailto:`
- Messages forwarded to Telegram through a Netlify Function
- Optional Telegram handle field from the sender
- Honeypot field for low-effort bot filtering
- Cloudflare Turnstile verification when configured

### Reliability

- Cached GitHub data in `localStorage`
- Fallback profile, stats, repos, and README content
- Graceful behavior when GitHub API rate limits are reached

## Project Structure

```text
src/
  components/
    About.jsx
    Contact.jsx
    GenerativeThumbnail.jsx
    Hero.jsx
    Icon.jsx
    Navbar.jsx
    Projects.jsx
    ScrollToTop.jsx
    ThreeBackground.jsx
  services/
    github.js
  App.jsx
  index.css
  main.jsx

netlify/
  functions/
    contact.js

public/
  avatar.jpg
```

## Local Development

### Prerequisites

- Node.js 20+ recommended
- npm

### Install

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
```

## Environment Variables

The site works partially without extra configuration, but the contact flow and spam protection require environment variables.

### Frontend

Create a local `.env` file if needed:

```bash
VITE_CONTACT_ENDPOINT=/.netlify/functions/contact
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

### Netlify Function

Configure these in Netlify environment variables:

```bash
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret_key
```

## Contact Flow

1. A visitor submits the contact form.
2. The frontend sends a `POST` request to `/.netlify/functions/contact`.
3. The function validates the payload.
4. If Turnstile is configured, the token is verified server-side.
5. The message is forwarded to Telegram using the Bot API.
6. If the sender included a Telegram username, the message includes an `Open Telegram` button.

## Netlify Deployment

This project is configured for Netlify in [`netlify.toml`](./netlify.toml).

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- SPA redirect: all routes to `index.html`

Typical deploy flow:

```bash
git add .
git commit -m "your message"
git push origin main
```

Netlify auto-deploys from `main`.

## Notes

- GitHub API usage is anonymous by default and therefore subject to rate limits.
- The application includes local fallback data to avoid a broken UI during API failures or rate limiting.
- Turnstile enforcement is enabled only when the relevant site key and secret key are configured.

## License

This repository is maintained as a personal portfolio project.
