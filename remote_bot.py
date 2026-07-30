import os, time, httpx, traceback

BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_KEY", "")
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY", "")
API = "https://api.telegram.org/bot" + BOT_TOKEN

# Короткий промпт — экономия токенов
SYS = "Ты Мимо, помощник. На ты, с эмодзи, кратко. Помогаешь с сайтом sbteplo.ru и кодом."

history = []
offset = 0

def log(m): print("[%s] %s" % (time.strftime("%H:%M:%S"), m), flush=True)

def tg(method, data=None):
    return httpx.post(API + "/" + method, json=data or {}, timeout=30).json()

def send(cid, text):
    try: tg("sendMessage", {"chat_id": cid, "text": str(text)[:4000]})
    except: pass

def ai(msgs):
    sys = [{"role": "system", "content": SYS}]
    if DEEPSEEK_KEY:
        try:
            r = httpx.post("https://api.deepseek.com/chat/completions",
                headers={"Authorization": "Bearer " + DEEPSEEK_KEY, "Content-Type": "application/json"},
                json={"model": "deepseek-chat", "messages": sys + msgs[-3:], "max_tokens": 100, "temperature": 0.7},
                timeout=20)
            if r.status_code == 200: return r.json()["choices"][0]["message"]["content"]
        except: pass
    if OPENROUTER_KEY:
        try:
            r = httpx.post("https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": "Bearer " + OPENROUTER_KEY, "Content-Type": "application/json"},
                json={"model": "nvidia/nemotron-3-ultra-550b-a55b:free", "messages": sys + msgs[-3:], "max_tokens": 80, "temperature": 0.7},
                timeout=20)
            if r.status_code == 200: return r.json()["choices"][0]["message"]["content"]
        except: pass
    return "Попробуй позже или звони: +7(911)924-54-25"

def handle(cid, text):
    try:
        if text == "/start":
            send(cid, "Привет! Я Мимо. Помогу с сайтом и кодом. Пиши!")
            return
        history.append({"role": "user", "content": text})
        reply = ai(history)
        history.append({"role": "assistant", "content": reply})
        send(cid, reply)
    except Exception as e:
        log("err: " + str(e))
        send(cid, "Ошибка, попробуй ещё!")

log("Бот запущен!")
while True:
    try:
        r = tg("getUpdates", {"offset": offset, "timeout": 10})
        if r.get("ok"):
            for u in r.get("result", []):
                offset = u["update_id"] + 1
                msg = u.get("message", {})
                if msg.get("text"):
                    log("[%s] %s" % (msg["chat"].get("first_name","?"), msg["text"][:50]))
                    handle(msg["chat"]["id"], msg["text"])
    except KeyboardInterrupt: break
    except: time.sleep(5)
