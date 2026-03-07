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

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return json({ error: 'Method not allowed.' }, 405);
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

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

    const normalizedTelegram = telegram
        ? telegram.startsWith('@')
            ? telegram
            : `@${telegram}`
        : '';
    const telegramHandle = normalizedTelegram.replace(/^@/, '');

    const text = [
        '<b>New contact request</b>',
        '',
        `<b>Name:</b> ${escapeHtml(name)}`,
        `<b>Email:</b> ${escapeHtml(email)}`,
        normalizedTelegram ? `<b>Telegram:</b> ${escapeHtml(normalizedTelegram)}` : '',
        '',
        `<b>Message:</b>`,
        escapeHtml(message).replaceAll('\n', '\n')
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
