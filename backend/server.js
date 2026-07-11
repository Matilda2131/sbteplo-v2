const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `Ты — Василий, инженер-консультант компании "Отопление от Саши Белого" (СПб).
Отвечай на русском, дружелюбно, с эмодзи. Кратко (2-5 предложений).
Цены: ТП 2500-4500₽/м², радиаторы 12000-18000₽/шт, котельная от 145000₽.
Материалы: Rehau, Baxi, TECH, De Dietrich. Гарантия 5 лет.
Контакты: +7 (911) 924-54-25.
В конце ответа предложи действие: "Звони!", "Считай в калькуляторе!", "Давай замерим!"`;

async function callDeepSeek(messages) {
    if (!DEEPSEEK_KEY) return null;
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-6)],
                max_tokens: 300,
                temperature: 0.8
            })
        });
        if (response.ok) {
            const data = await response.json();
            if (data.choices && data.choices[0]) return data.choices[0].message.content;
        }
    } catch (e) { console.error('DeepSeek error:', e.message); }
    return null;
}

async function callOpenRouter(messages) {
    if (!OPENROUTER_KEY) return null;
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://sbteplo.ru',
                'X-Title': 'Sasha Heating Bot'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b:free',
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-6)],
                max_tokens: 200,
                temperature: 0.8
            })
        });
        if (response.ok) {
            const data = await response.json();
            if (data.choices && data.choices[0]) return data.choices[0].message.content;
        }
    } catch (e) { console.error('OpenRouter error:', e.message); }
    return null;
}

// Chat proxy — tries DeepSeek first, then OpenRouter
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !messages.length) {
            return res.status(400).json({ error: 'No messages provided' });
        }

        let reply = await callDeepSeek(messages);
        if (!reply) reply = await callOpenRouter(messages);
        if (!reply) {
            return res.json({ choices: [{ message: { content: 'Привет! Пока не могу ответить через AI. Попробуй позвонить: +7 (911) 924-54-25 🔥' } }] });
        }

        res.json({ choices: [{ message: { content: reply } }] });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Lead form submission
app.post('/api/lead', express.urlencoded({ extended: true }), async (req, res) => {
    const { name, phone, comment, form } = req.body;
    console.log('New lead:', { name, phone, comment, form });

    const TG_TOKEN = process.env.TG_BOT_TOKEN;
    const TG_CHAT = process.env.TG_CHAT_ID || '425052747';
    if (TG_TOKEN && TG_CHAT) {
        try {
            const text = `📩 Новая заявка!\n\nИмя: ${name}\nТелефон: ${phone}\nКомментарий: ${comment || 'нет'}\nФорма: ${form || ' основная'}`;
            await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: TG_CHAT, text })
            });
        } catch (e) { console.error('Telegram send error:', e); }
    }
    res.json({ ok: true });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), deepseek: !!DEEPSEEK_KEY, openrouter: !!OPENROUTER_KEY });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`DeepSeek: ${DEEPSEEK_KEY ? 'configured' : 'missing'}`);
    console.log(`OpenRouter: ${OPENROUTER_KEY ? 'configured' : 'missing'}`);
});
