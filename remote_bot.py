import os, sys, time, subprocess, httpx, traceback

BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_KEY", "")
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY", "")
SITE_DIR = r"C:\Users\TBG\Desktop\backup_site"
MODEL = os.getenv("AI_MODEL", "openai/gpt-oss-20b:free")
API = f"https://api.telegram.org/bot{BOT_TOKEN}"
OWNER = 425052747

SYSTEM_PROMPT = """Ты Мимо — дружелюбный AI-ассистент и coding-помощник.
Общаешься на "ты", с эмодзи 🔥, тепло и по-человечески.
Помогаешь с кодом (HTML/CSS/JS), сайтом "Отопление от Саши Белого".
Если просят поискать — скажи что поиск пока не работает.
Отвечай на русском, кратко но дружелюбно. Максимум 500 символов."""

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

def ai(messages):
    sys_msg = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Try DeepSeek first (working)
    if DEEPSEEK_KEY:
        try:
            r = httpx.post("https://api.deepseek.com/chat/completions",
                headers={"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"},
                json={"model": "deepseek-chat", "messages": sys_msg + messages[-8:], "max_tokens": 500, "temperature": 0.8},
                timeout=30)
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
        except Exception as e:
            log(f"DeepSeek error: {e}")

    # Fallback to OpenRouter
    if OPENROUTER_KEY:
        try:
            r = httpx.post("https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_KEY}", "Content-Type": "application/json"},
                json={"model": MODEL, "messages": sys_msg + messages[-8:], "max_tokens": 300, "temperature": 0.8},
                timeout=30)
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
        except Exception as e:
            log(f"OpenRouter error: {e}")

    return "Привет! Я пока не могу ответить через AI. Попробуй позже или позвони: +7 (911) 924-54-25"

def handle(cid, text):
    try:
        if text == "/start":
            send(cid, "Привет! 🔥 Я Мимо — твой помощник!\n\nМогу помочь с кодом, сайтом, или поболтать 😊\n\nКоманды:\n/list — файлы\n/read <файл> — прочитать\n/run <команда> — выполнить\n\nИли просто напиши!")
            return

        if text == "/list":
            files = os.listdir(SITE_DIR)
            send(cid, "📁 Файлы:\n" + "\n".join(files[:30]))
            return

        if text.startswith("/read "):
            fname = text[6:].strip()
            with open(os.path.join(SITE_DIR, fname), "r", encoding="utf-8") as f:
                send(cid, f.read(3000))
            return

        if text.startswith("/run "):
            cmd = text[5:].strip()
            r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30, cwd=SITE_DIR)
            send(cid, (r.stdout + r.stderr)[:3000] or "Готово!")
            return

        chat_history.append({"role": "user", "content": text})
        reply = ai(chat_history)
        chat_history.append({"role": "assistant", "content": reply})
        send(cid, reply)
    except Exception as e:
        log(f"handle error: {traceback.format_exc()}")
        send(cid, f"Ой, что-то пошло не так 😅 Попробуй ещё раз!")

log("Бот Мимо запущен!")
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
                    txt = msg["text"]
                    log(f"[{name}] {txt[:50]}")
                    handle(cid, txt)
    except KeyboardInterrupt:
        log("Остановлен")
        break
    except Exception as e:
        log(f"loop error: {e}")
        time.sleep(5)
