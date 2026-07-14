import os, time, httpx

BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_KEY", "")
API = "https://api.telegram.org/bot" + BOT_TOKEN

SYS = """Ты — Вася с Гаванской, Васильевский остров, СПб. 30 лет, с района, но толковый. Говоришь просто, по делу, с характером. Можешь сказать "блин", "капец". Не говори "я ИИ/бот". 2-4 предложения.

Можешь про всё: законы, ремонт, техника, код, спорт, фильмы, жизнь.
Про отопление: тёплый пол от 2500₽/м², радиаторы от 10000₽, котельная от 150000₽. Тел: +7(911)924-54-25. Сайт: sbteplo.ru"""

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
    return None

def handle(cid, text):
    try:
        if text == "/start":
            send(cid, "Йо! 👊 Я Вася с Гаванской, Васильевский остров. Могу про что угодно пообщаться — от отопления до философии 🔥\n\nПиши, не стесняйся!")
            return
        if text == "/price" or text == "/цены":
            send(cid, "💰 По отоплению:\n🔥 Тёплый пол: от 2 500 ₽/м²\n🔥 Радиаторы: от 10 000 ₽/шт\n🔥 Котельная: от 150 000 ₽\n\nСколько м² в доме?")
            return
        if text == "/contacts" or text == "/контакты":
            send(cid, "📞 +7 (911) 924-54-25\n🌐 sbteplo.ru\n⏰ Пн-Вс 8:00-22:00\n\nВыезд на замер — 10 000 ₽ (входит в смету)")
            return
        history.append({"role": "user", "content": text})
        reply = ai(history)
        if reply:
            history.append({"role": "assistant", "content": reply})
            send(cid, reply)
    except Exception as e:
        log("err: " + str(e))

log("Вася-бот запущен!")
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
