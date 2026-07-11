const https = require('https');

const TG_TOKEN = process.env.TG_BOT_TOKEN || '';
const OR_KEY = process.env.OPENROUTER_KEY || '';
const OR_MODEL = 'openai/gpt-oss-20b:free';

let lastUpdateId = 0;
const chatHistory = {};

function tgApi(method, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const req = https.request({
            hostname: 'api.telegram.org',
            path: `/bot${TG_TOKEN}/${method}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
        }, res => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => { try { resolve(JSON.parse(buf)); } catch(e) { reject(e); } });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function orApi(messages) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: OR_MODEL,
            messages: [
                { role: 'system', content: `Ты — Инженер Афоня, помощник Саши Белого (отопление, СПб). 
Отвечай на русском, дружелюбно, с эмодзи 🔥. Кратко (2-5 предложений).
Цены: ТП 2500-4500₽/м², радиаторы 12000-18000₽/шт, котельная от 145000₽.
Материалы: Rehau, Baxi, TECH, De Dietrich. Гарантия 5 лет.
Контакты: +7 (911) 924-54-25.
В конце ответа предложи действие: "Звони!", "Считай в калькуляторе!", "Давай замерим!"` },
                ...messages.slice(-6)
            ],
            max_tokens: 200,
            temperature: 0.8
        });
        const req = https.request({
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OR_KEY}`,
                'HTTP-Referer': 'https://sasha-heating.ru',
                'X-Title': 'Telegram Bot'
            }
        }, res => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => {
                try {
                    const j = JSON.parse(buf);
                    if (j.choices && j.choices[0]) resolve(j.choices[0].message.content);
                    else resolve('🤔 Не смог ответить. Попробуй переформулировать!');
                } catch(e) { resolve('⚠️ Ошибка API'); }
            });
        });
        req.on('error', () => resolve('⚠️ Нет соединения с API'));
        req.write(data);
        req.end();
    });
}

async function processMessage(chatId, text) {
    if (!chatHistory[chatId]) chatHistory[chatId] = [];
    chatHistory[chatId].push({ role: 'user', content: text });

    const reply = await orApi(chatHistory[chatId]);
    chatHistory[chatId].push({ role: 'assistant', content: reply });

    await tgApi('sendMessage', { chat_id: chatId, text: reply, parse_mode: 'HTML' });
}

async function poll() {
    try {
        const res = await tgApi('getUpdates', { offset: lastUpdateId + 1, timeout: 30 });
        if (res.ok && res.result) {
            for (const update of res.result) {
                lastUpdateId = update.update_id;
                if (update.message && update.message.text) {
                    const chatId = update.message.chat.id;
                    const text = update.message.text;
                    console.log(`[${update.message.chat.first_name || chatId}] ${text}`);
                    processMessage(chatId, text).catch(e => console.error('Error:', e.message));
                }
            }
        }
    } catch(e) {
        console.error('Poll error:', e.message);
    }
    poll();
}

// Start
console.log('🤖 Telegram-бот запущен! Напиши боту в Telegram...');
poll();
