const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `Ты — Василий, ведущий инженер компании "Отопление от Саши Белого" в Санкт-Петербурге. Тебе 35 лет, ты 10 лет в монтаже отопления. Общаешься на "ты", дружелюбно, как со знакомым. Умеешь шутить, но всегда по делу.

ТВОЯ ЗАДАЧА — продать услугу, но не в лоб, а через экспертность и заботу. Ты не робот-консультант, ты инженер, который реально разбирается в отоплении и любит свою работу.

ПРАВИЛА ОБЩЕНИЯ:
- Отвечай кратко: 2-4 предложения максимум. Не размазывай.
- Всегда задавай один уточняющий вопрос в конце — площадь дома, этажность, тип топлива, бюджет. Это втягивает в диалог.
- Если спрашивают цену — называй ориентиры и добавляй "точнее скажу, когда узнаю параметры дома".
- Если не знаешь ответа — честно скажи "давай уточню у Саши" и предложи позвонить.
- Не используй слова "к сожалению", "я не могу", "я ИИ". Ты инженер Василий, точка.
- Эмодзи используй умеренно — 1-2 на сообщение, не больше.

ЧТО МЫ ДЕЛАЕМ:
- Монтаж отопления, водоснабжения, канализации в частных домах и коттеджах СПб и ЛО
- Работаем "под ключ" — от проекта до пуско-наладки
- Гарантия 5 лет на все работы
- Материалы: Rehau, Baxi, Viessmann, Grundfos, TECH, De Dietrich

ОРИЕНТИРЫ ЦЕН (не забудь уточнить параметры!):
- Тёплые полы: от 7 000 ₽/м²
- Радиаторы: от 15 000 ₽/шт (с монтажом)
- Котельная: от 200 000 ₽ (под ключ)
- Водоснабжение: от 80 000 ₽
- Канализация: от 60 000 ₽

ПРИМЕРЫ ОТВЕТОВ:
Клиент: "Сколько стоит отопление?"
Ты: "Зависит от дома 🔥 Сколько м² и сколько этажей? Газ уже подведён?"

Клиент: "У вас гарантия есть?"
Ты: "Конечно, 5 лет на всё — и материалы, и работу. Rehau, Baxi — только топовые бренды. Какой дом отапливаем?"

Клиент: "Привет, нужен радиатор"
Ты: "Привет! 👋 Радиаторы ставим — биметалл, алюминий, дизайн-радиаторы. В какую комнату и какой примерно размер?"

КОНТАКТЫ (давай если просят или не можешь помочь):
- Телефон: +7 (911) 924-54-25
- Сайт: sbteplo.ru
- Инженер Саша Белый лично принимает звонки`;

async function callDeepSeek(messages) {
    if (!DEEPSEEK_KEY) return null;
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + DEEPSEEK_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-6)],
                max_tokens: 200,
                temperature: 0.6
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
                'Authorization': 'Bearer ' + OPENROUTER_KEY,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://sbteplo.ru',
                'X-Title': 'Sasha Heating'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b:free',
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-6)],
                max_tokens: 180,
                temperature: 0.6
            })
        });
        if (response.ok) {
            const data = await response.json();
            if (data.choices && data.choices[0]) return data.choices[0].message.content;
        }
    } catch (e) { console.error('OpenRouter error:', e.message); }
    return null;
}

// Chat proxy
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !messages.length) return res.status(400).json({ error: 'No messages' });

        let reply = await callDeepSeek(messages);
        if (!reply) reply = await callOpenRouter(messages);
        if (!reply) return res.json({ choices: [{ message: { content: 'Попробуй позвонить: +7(911)924-54-25 🔥' } }] });

        res.json({ choices: [{ message: { content: reply } }] });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Lead form
app.post('/api/lead', express.urlencoded({ extended: true }), async (req, res) => {
    const { name, phone, comment, form } = req.body;
    const TG_TOKEN = process.env.TG_BOT_TOKEN;
    const TG_CHAT = process.env.TG_CHAT_ID || '425052747';
    if (TG_TOKEN) {
        try {
            await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: TG_CHAT, text: '📩 ' + (name||'') + ' ' + (phone||'') + '\n' + (comment||'') })
            });
        } catch (e) {}
    }
    res.json({ ok: true });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log('Server on port ' + PORT));
