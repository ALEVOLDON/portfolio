const json = (body, status = 200) => ({
    statusCode: status,
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
});

const escapeHtml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const formatTimestamp = () => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Moscow'
    });

    return formatter.format(new Date()).replace(',', '');
};

const verifyTurnstileToken = async ({ secretKey, token, ip }) => {
    const body = new URLSearchParams({
        secret: secretKey,
        response: token
    });

    if (ip) {
        body.set('remoteip', ip);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    });

    if (!response.ok) {
        throw new Error('Turnstile verification failed.');
    }

    return response.json();
};

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return json({ error: 'Method not allowed.' }, 405);
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!botToken || !chatId) {
        return json({ error: 'Telegram integration is not configured.' }, 500);
    }

    let payload;

    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return json({ error: 'Invalid request body.' }, 400);
    }

    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const telegram = String(payload.telegram || '').trim();
    const message = String(payload.message || '').trim();
    const company = String(payload.company || '').trim();
    const turnstileToken = String(payload.turnstileToken || '').trim();

    if (company) {
        return json({ ok: true });
    }

    if (!name || !email || !message) {
        return json({ error: 'Name, email, and message are required.' }, 400);
    }

    if (name.length > 80 || email.length > 120 || telegram.length > 64 || message.length > 2000) {
        return json({ error: 'Message is too long.' }, 400);
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return json({ error: 'Invalid email address.' }, 400);
    }

    if (turnstileSecretKey) {
        if (!turnstileToken) {
            return json({ error: 'Spam check is required.' }, 400);
        }

        try {
            const verification = await verifyTurnstileToken({
                secretKey: turnstileSecretKey,
                token: turnstileToken,
                ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || ''
            });

            if (!verification.success) {
                return json({ error: 'Spam check failed. Try again.' }, 400);
            }
        } catch (error) {
            console.error('Turnstile verification error:', error);
            return json({ error: 'Spam protection is unavailable right now.' }, 502);
        }
    }

    const normalizedTelegram = telegram
        ? telegram.startsWith('@')
            ? telegram
            : `@${telegram}`
        : '';
    const telegramHandle = normalizedTelegram.replace(/^@/, '');
    const submittedAt = formatTimestamp();

    const text = [
        '<b>New Lead</b>',
        '<i>alevoldon.com</i>',
        '',
        `<b>Name</b>: ${escapeHtml(name)}`,
        `<b>Email</b>: ${escapeHtml(email)}`,
        normalizedTelegram ? `<b>Telegram</b>: ${escapeHtml(normalizedTelegram)}` : '',
        `<b>Time</b>: ${submittedAt} MSK`,
        '',
        '<b>Message</b>',
        `<blockquote>${escapeHtml(message).replaceAll('\n', '\n')}</blockquote>`
    ].filter(Boolean).join('\n');

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            ...(telegramHandle ? {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Open Telegram',
                                url: `https://t.me/${telegramHandle}`
                            }
                        ]
                    ]
                }
            } : {})
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Telegram API error:', errorText);
        return json({ error: 'Failed to forward message to Telegram.' }, 502);
    }

    return json({ ok: true });
}
