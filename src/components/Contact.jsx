import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

const INITIAL_FORM = {
    name: '',
    email: '',
    telegram: '',
    message: '',
    company: ''
};

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
let turnstileLoader;

const loadTurnstile = () => {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Window is not available.'));
    }

    if (window.turnstile) {
        return Promise.resolve(window.turnstile);
    }

    if (!turnstileLoader) {
        turnstileLoader = new Promise((resolve, reject) => {
            const existing = document.getElementById(TURNSTILE_SCRIPT_ID);

            if (existing) {
                existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
                existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile.')), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.id = TURNSTILE_SCRIPT_ID;
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.onload = () => resolve(window.turnstile);
            script.onerror = () => reject(new Error('Failed to load Turnstile.'));
            document.head.appendChild(script);
        });
    }

    return turnstileLoader;
};

const Contact = () => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [status, setStatus] = useState('idle');
    const [feedback, setFeedback] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [turnstileReady, setTurnstileReady] = useState(false);
    const widgetRef = useRef(null);
    const widgetIdRef = useRef(null);
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const turnstileEnabled = Boolean(siteKey);

    useEffect(() => {
        if (!turnstileEnabled || !widgetRef.current) {
            return undefined;
        }

        let cancelled = false;

        loadTurnstile()
            .then((turnstile) => {
                if (cancelled || !widgetRef.current || !turnstile) {
                    return;
                }

                if (widgetIdRef.current !== null) {
                    turnstile.remove(widgetIdRef.current);
                    widgetIdRef.current = null;
                }

                widgetIdRef.current = turnstile.render(widgetRef.current, {
                    sitekey: siteKey,
                    theme: 'dark',
                    callback: (token) => {
                        setTurnstileToken(token);
                        setTurnstileReady(true);
                    },
                    'expired-callback': () => {
                        setTurnstileToken('');
                        setTurnstileReady(false);
                    },
                    'error-callback': () => {
                        setTurnstileToken('');
                        setTurnstileReady(false);
                        setStatus('error');
                        setFeedback('Spam protection failed to load. Refresh and try again.');
                    }
                });
            })
            .catch(() => {
                if (!cancelled) {
                    setTurnstileReady(false);
                    setStatus('error');
                    setFeedback('Spam protection failed to load. Refresh and try again.');
                }
            });

        return () => {
            cancelled = true;
            if (window.turnstile && widgetIdRef.current !== null) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [siteKey, turnstileEnabled]);

    const resetTurnstile = () => {
        setTurnstileToken('');
        setTurnstileReady(false);

        if (window.turnstile && widgetIdRef.current !== null) {
            window.turnstile.reset(widgetIdRef.current);
        }
    };

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));

        if (status !== 'idle') {
            setStatus('idle');
            setFeedback('');
        }
    };

    const submitForm = async (event) => {
        event.preventDefault();

        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setStatus('error');
            setFeedback('Fill in name, email, and message.');
            return;
        }

        if (turnstileEnabled && !turnstileToken) {
            setStatus('error');
            setFeedback('Complete the spam check before sending.');
            return;
        }

        if (form.company.trim()) {
            setStatus('success');
            setFeedback('Message sent.');
            setForm(INITIAL_FORM);
            if (turnstileEnabled) resetTurnstile();
            return;
        }

        setStatus('sending');
        setFeedback('');

        try {
            const response = await fetch(import.meta.env.VITE_CONTACT_ENDPOINT || '/.netlify/functions/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    telegram: form.telegram.trim(),
                    message: form.message.trim(),
                    company: form.company.trim(),
                    turnstileToken
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message.');
            }

            setStatus('success');
            setFeedback('Message sent. I will get it in Telegram.');
            setForm(INITIAL_FORM);
            if (turnstileEnabled) resetTurnstile();
        } catch (err) {
            console.error('Failed to send message:', err);
            setStatus('error');
            setFeedback(err.message || 'Failed to send message.');
            if (turnstileEnabled) resetTurnstile();
        }
    };

    return (
        <section id="contact" className="py-32 px-6 bg-gradient-to-t from-black via-black to-transparent relative z-10">
            <div className="max-w-2xl mx-auto text-center reveal">
                <div className="inline-block p-3 rounded-full bg-white/5 mb-6 animate-bounce"><Icon name="mail" size={24} className="text-cyber-purple" /></div>
                <h2 className="text-4xl font-bold mb-6 text-white">Initialize Communication</h2>
                <p className="text-gray-400 mb-10 text-lg">Ready to collaborate on the next big thing? <br />Send the brief here and I will get it in Telegram.</p>
                <form onSubmit={submitForm} className="space-y-4 text-left">
                    <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={updateField}
                        autoComplete="off"
                        tabIndex="-1"
                        className="hidden"
                        aria-hidden="true"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-sm font-mono uppercase tracking-[0.2em] text-gray-500">Name</span>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={updateField}
                                maxLength="80"
                                className="w-full rounded border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-cyber-cyan focus:bg-white/8"
                                placeholder="Your name"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-2 block text-sm font-mono uppercase tracking-[0.2em] text-gray-500">Email</span>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={updateField}
                                maxLength="120"
                                className="w-full rounded border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-cyber-cyan focus:bg-white/8"
                                placeholder="you@example.com"
                            />
                        </label>
                    </div>
                    <label className="block">
                        <span className="mb-2 block text-sm font-mono uppercase tracking-[0.2em] text-gray-500">Telegram</span>
                        <input
                            type="text"
                            name="telegram"
                            value={form.telegram}
                            onChange={updateField}
                            maxLength="64"
                            className="w-full rounded border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-cyber-cyan focus:bg-white/8"
                            placeholder="@yourusername (optional)"
                        />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-sm font-mono uppercase tracking-[0.2em] text-gray-500">Message</span>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={updateField}
                            rows="6"
                            maxLength="2000"
                            className="h-40 w-full resize-none overflow-y-auto rounded border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-cyber-cyan focus:bg-white/8"
                            placeholder="Tell me about the project, timeline, and what you need."
                        />
                    </label>
                    {turnstileEnabled ? (
                        <div className="overflow-hidden rounded border border-white/10 bg-black/30 p-3">
                            <div ref={widgetRef} />
                            {!turnstileReady ? (
                                <p className="mt-2 text-xs text-gray-500">Complete the spam check before sending.</p>
                            ) : null}
                        </div>
                    ) : null}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="flex items-center justify-center gap-2 rounded bg-white px-8 py-4 font-bold text-black transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <Icon name={status === 'success' ? 'check' : 'send'} size={18} />
                            {status === 'sending' ? 'Sending...' : 'Send Message'}
                        </button>
                        <p className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
                            {feedback || (turnstileEnabled ? 'Protected by Cloudflare Turnstile.' : 'Replies go straight to Telegram.')}
                        </p>
                    </div>
                </form>
                <footer className="mt-24 pt-8 border-t border-white/5 text-gray-600 text-xs font-mono flex flex-col md:flex-row justify-between items-center gap-4">
                    <span>Р’В© {new Date().getFullYear()} ALEVOLDON. All systems nominal.</span>
                    <div className="flex gap-4">
                        <a href="https://github.com/ALEVOLDON" target="_blank" rel="noreferrer" className="hover:text-cyber-cyan transition-colors flex items-center gap-1">
                            <Icon name="github" size={14} /> GitHub
                        </a>
                        <a href="https://twitter.com/AleVoldon" target="_blank" rel="noreferrer" className="hover:text-cyber-cyan transition-colors flex items-center gap-1">
                            <Icon name="twitter" size={14} /> Twitter
                        </a>
                        <a href="https://codepen.io/GTWY" target="_blank" rel="noreferrer" className="hover:text-cyber-cyan transition-colors flex items-center gap-1">
                            <Icon name="code" size={14} /> CodePen
                        </a>
                    </div>
                </footer>
            </div>
        </section>
    );
};

export default Contact;
