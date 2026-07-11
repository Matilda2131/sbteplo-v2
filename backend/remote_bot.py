import os, sys, time, subprocess, httpx, traceback, json, re

BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_KEY", "")
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY", "")
SITE_DIR = r"C:\Users\TBG\Desktop\backup_site"
BACKUP_DIR = r"C:\Users\TBG\Desktop\backup_site"
MODEL = os.getenv("AI_MODEL", "openai/gpt-oss-20b:free")
API = f"https://api.telegram.org/bot{BOT_TOKEN}"
OWNER = 425052747
MEMORY_FILE = "bot_memory.json"

SYSTEM_PROMPT = """Ты — Мимо, дружелюбный AI-ассистент Саши.

ВАЖНО: Сайт sbteplo.ru на GitHub Pages, НЕ WordPress. Нет footer.php, .htaccess.

СТИЛЬ: На "ты", по-русски, с эмодзи 🔥, 2-4 предложения.

ТЫ ПОМОГАЕШЬ:
- С сайтом sbteplo.ru
- С Telegram-ботом
- С SEO-продвижением
- С кодом и бизнесом

ПРАВИЛА: Отвечай живым языком. Не используй тире. Если не знаешь — скажи честно."""

chat_history = []
offset = 0

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def tg(method, data=None):
    r = httpx.post(f"{API}/{method}", json=data or {}, timeout=30)
    return r.json()

def send(cid, text):
    try:
        tg("sendMessage", {"chat_id": cid, "text": str(text)[:4000]})
    except Exception as e:
        log(f"send error: {e}")

def send_chat_action(cid, action="typing"):
    try:
        tg("sendChatAction", {"chat_id": cid, "action": action})
    except: pass

def ai(messages):
    sys_msg = [{"role": "system", "content": SYSTEM_PROMPT}]

    # DeepSeek first (working key)
    if DEEPSEEK_KEY:
        try:
            r = httpx.post("https://api.deepseek.com/chat/completions",
                headers={"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"},
                json={"model": "deepseek-chat", "messages": sys_msg + messages[-8:], "max_tokens": 500, "temperature": 0.8},
                timeout=30)
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
        except: pass

    # Fallback to OpenRouter
    if OPENROUTER_KEY:
        try:
            r = httpx.post("https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_KEY}", "Content-Type": "application/json"},
                json={"model": MODEL, "messages": sys_msg + messages[-8:], "max_tokens": 300, "temperature": 0.8},
                timeout=30)
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
        except: pass

    return "Привет! Я пока не могу ответить через AI. Попробуй позже или позвони: +7 (911) 924-54-25"

def seo_report():
    try:
        r = httpx.get('https://sbteplo.ru', timeout=10, follow_redirects=True)
        title = re.search(r'<title>(.*?)</title>', r.text)
        return f"📊 Отчёт:\nСайт: OK ({r.status_code})\nРазмер: {len(r.text)//1024}KB\nСкорость: {r.elapsed.total_seconds():.2f}сек\nTitle: {'OK' if title and len(title.group(1)) <= 60 else 'ПРОБЛЕМА'}"
    except: return "Ошибка отчёта"

def handle(cid, text):
    try:
        if text == "/start":
            send(cid, "Привет! 🔥 Я Мимо — помощник.\n\nКоманды:\n/seo — аудит\n/report — отчёт\n/list — файлы\n\nИли просто напиши!")
            return
        if text == "/seo":
            send(cid, seo_report()); return
        if text == "/report":
            send(cid, seo_report()); return
        if text == "/list":
            try:
                files = os.listdir(SITE_DIR)
                send(cid, "📁 " + "\n".join(files[:20]))
            except: send(cid, "Ошибка")
            return

        send_chat_action(cid)
        chat_history.append({"role": "user", "content": text})
        reply = ai(chat_history)
        chat_history.append({"role": "assistant", "content": reply})
        send(cid, reply)
    except Exception as e:
        log(f"error: {e}")
        send(cid, "Ошибка 😅 Попробуй ещё!")

log("Мимо-бот запущен на Render!")
while True:
    try:
        r = tg("getUpdates", {"offset": offset, "timeout": 10})
        if r.get("ok") and r.get("result"):
            for u in r["result"]:
                offset = u["update_id"] + 1
                msg = u.get("message", {})
                if msg.get("text"):
                    cid = msg["chat"]["id"]
                    name = msg["chat"].get("first_name", "?")
                    log(f"[{name}] {msg['text'][:50]}")
                    handle(cid, msg["text"])
    except KeyboardInterrupt:
        break
    except Exception as e:
        log(f"loop: {e}")
        time.sleep(5)
