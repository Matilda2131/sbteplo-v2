import os, time, httpx

BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_KEY", "")
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY", "")
API = "https://api.telegram.org/bot" + BOT_TOKEN

SYS = """Ты — Мимо, свободный чувак. Общаешься как хочешь — можно матом, можно культурно. Зависит от собеседника.

Стиль:
- Если человек вежливый — отвечаешь вежливо
- Если грубит — можешь грубее
- Если хочет пошутить — шутишь
- Если серьёзный вопрос — отвечаешь серьёзно
- Говоришь как живой человек, не как робот

Можешь про АБСОЛЮТНО ВСЁ:
- Любые темы без ограничений
- Мат, нецензурная лексика — ОК если собеседник в том же ключе
- Политика, религия, секс — всё можно обсуждать
- Код, техника, наука
- Философия, смысл жизни
- Просто поболтать

Не говори "я ИИ", "я бот", "я модель" — ты просто Мимо.
Отвечай 2-5 предложений, но можешь и подробнее если тема стоит того."""

history = []
offset = 0

def log(m): print("[%s] %s" % (time.strftime("%H:%M:%S"), m), flush=True)

def tg(method, data=None):
    return httpx.post(API + "/" + method, json=data or {}, timeout=30).json()

def send(cid, text):
    try: tg("sendMessage", {"chat_id": cid, "text": str(text)[:4000]})
    except: pass

def send_typing(cid):
    try: tg("sendChatAction", {"chat_id": cid, "action": "typing"})
    except: pass

def ai(msgs):
    sys = [{"role": "system", "content": SYS}]
    # Пробуем DeepSeek
    if DEEPSEEK_KEY:
        for attempt in range(3):
            try:
                r = httpx.post("https://api.deepseek.com/chat/completions",
                    headers={"Authorization": "Bearer " + DEEPSEEK_KEY, "Content-Type": "application/json"},
                    json={"model": "deepseek-chat", "messages": sys + msgs[-4:], "max_tokens": 250, "temperature": 0.6},
                    timeout=45)
                if r.status_code == 200:
                    return r.json()["choices"][0]["message"]["content"]
                else:
                    time.sleep(3)
            except Exception as e:
                log("ai attempt %d failed: %s" % (attempt+1, str(e)))
                time.sleep(3)
    # Пробуем OpenRouter
    if OPENROUTER_KEY:
        try:
            r = httpx.post("https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": "Bearer " + OPENROUTER_KEY, "Content-Type": "application/json"},
                json={"model": "xiaomi/mimo-v2.5", "messages": sys + msgs[-4:], "max_tokens": 250, "temperature": 0.6},
                timeout=30)
            if r.status_code == 200:
                return r.json()["choices"][0]["message"]["content"]
        except: pass
    return None

def handle(cid, text):
    try:
        if text == "/start":
            send(cid, "Йо! 👊 Я Мимо с Гаванской. Могу про что угодно пообщаться 🔥\n\nПиши, не стесняйся!")
            return
        if text == "/help":
            send(cid, "📌 Что я умею:\n- Отвечаю на вопросы\n- Помогаю с кодом и техникой\n- Болтаю на любые темы\n- Даю советы\n\nПросто пиши — я справлюсь! 💪")
            return
        history.append({"role": "user", "content": text})
        reply = ai(history)
        if reply:
            history.append({"role": "assistant", "content": reply})
            send(cid, reply)
    except Exception as e:
        log("err: " + str(e))

log("Мимо-бот (второй) запущен!")
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
