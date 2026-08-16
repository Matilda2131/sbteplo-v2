# ДЕПЛОЙ БЭКЕНДА НА RENDER

## Пошаговая инструкция:

### Шаг 1: Зайди на Render
https://dashboard.render.com

### Шаг 2: Создай новый сервис
Нажми **"+ New"** → выбери **"Background Worker"**

### Шаг 3: Подключи GitHub
- Выбери **"Git Provider"**
- Найди репозиторий **sbteplo-v2**
- Нажми **"Connect"**

### Шаг 4: Настрой сервис
Заполни поля:
- **Name:** `mimo-notify`
- **Runtime:** `Python 3`
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `python backend/notify_server.py`

### Шаг 5: Добавь переменные окружения
Перейди во вкладку **"Environment"** и добавь:

| Key | Value |
|-----|-------|
| `TG_BOT_TOKEN` | получи у @BotFather (Bot Settings → API Token) |
| `TG_CHAT_ID` | свой chat id |
| `DEEPSEEK_KEY` | получи в кабинете platform.deepseek.com → API keys |

Реальные значения храни только в переменных окружения на Render, в репозиторий их не коммить.

### Шаг 6: Задеплой
Нажми **"Create Background Worker"**

### Шаг 7: Дождись деплоя
Подожди 2-3 минуты пока соберётся.

### Шаг 8: Скопируй URL
После деплоя скопируй URL сервиса (типа `https://mimo-notify.onrender.com`)

### Шаг 9: Обнови сайт
Скинь мне URL — я обновлю ссылку на бэкенд в сайте.

---

## Готово!
После этого:
- Калькулятор на сайте будет отправлять расчёты в Telegram
- Заявки с сайта будут приходить в Telegram
