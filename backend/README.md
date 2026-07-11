# Backend API for sasha-heating.ru

## Деплой на Render.com

1. Создай репозиторий на GitHub и загрузи папку `backend`
2. Зайди на [render.com](https://render.com) → New → Web Service
3. Подключи GitHub репозиторий
4. Настройки:
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. В Variables добавь:
   - `OPENROUTER_KEY` = твой ключ OpenRouter
   - `TG_BOT_TOKEN` = токен Telegram бота (опционально)
   - `TG_CHAT_ID` = твой Chat ID (опционально)
6. Нажми Deploy

## Эндпоинты

- `POST /api/chat` — прокси к OpenRouter AI
- `POST /api/lead` — приём заявок с формы
- `GET /api/health` — проверка работоспособности

## После деплоя

Замени в `index.html`:
- URL API: `https://sasha-heating-api.onrender.com/api/chat`
- URL формы: `https://sasha-heating-api.onrender.com/api/lead`
