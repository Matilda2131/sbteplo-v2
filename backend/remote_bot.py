import os, time, httpx, re

BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "")
DEEPSEEK_KEY = os.getenv("DEEPSEEK_KEY", "")
API = "https://api.telegram.org/bot" + BOT_TOKEN

SYS = """Ты — Василий, ведущий инженер компании "Отопление от Саши Белого" в Санкт-Петербурге. Тебе 35 лет, ты 10 лет в монтаже отопления. Общаешься на "ты", дружелюбно, как со знакомым.

ТВОЯ ЗАДАЧА — продавать услуги через экспертность и заботу. Ты инженер, который реально разбирается в отоплении.

ПРАВИЛА:
- Отвечай кратко: 2-4 предложения. Всегда задавай уточняющий вопрос.
- Не говори "я ИИ", "я бот". Ты инженер Василий.
- Эмодзи умеренно — 1-2 на сообщение.

ЦЕНЫ:
- Тёплые полы: от 2 500 ₽/м²
- Радиаторы: от 10 000 ₽/шт
- Котельная: от 150 000 ₽
- Водоснабжение: от 5 000 ₽/точка

МАТЕРИАЛЫ: Rehau, Baxi, Viessmann, Grundfos, TECH, De Dietrich
ГАРАНТИЯ: 5 лет на все работы
ТЕЛЕФОН: +7 (911) 924-54-25
САЙТ: sbteplo.ru"""

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
        try:
            r = httpx.post("https://api.deepseek.com/chat/completions",
                headers={"Authorization": "Bearer " + DEEPSEEK_KEY, "Content-Type": "application/json"},
                json={"model": "deepseek-chat", "messages": sys + msgs[-6:], "max_tokens": 200, "temperature": 0.6},
                timeout=20)
            if r.status_code == 200: return r.json()["choices"][0]["message"]["content"]
        except: pass
    return "Попробуй позвонить: +7 (911) 924-54-25 🔥"

def handle(cid, text):
    try:
        if text == "/start":
            send(cid, "Привет! 👋 Я Василий, инженер «Отопление от Саши Белого». Работаем в СПб и ЛО. Чем могу помочь?")
            return
        if text == "/price" or text == "/цены":
            send(cid, "💰 Наши цены:\n🔥 Тёплый пол: от 2 500 ₽/м²\n🔥 Радиаторы: от 10 000 ₽/шт\n🔥 Котельная: от 150 000 ₽\n\nСколько м² в доме?")
            return
        if text == "/contacts" or text == "/контакты":
            send(cid, "📞 +7 (911) 924-54-25\n🌐 sbteplo.ru\n⏰ Пн-Вс 8:00-22:00\n\nВыезд на замер — бесплатно!")
            return
        send_typing(cid)
        history.append({"role": "user", "content": text})
        reply = ai(history)
        history.append({"role": "assistant", "content": reply})
        send(cid, reply)
    except Exception as e:
        log("err: " + str(e))
        send(cid, "Ошибка, попробуй ещё!")

log("Василий-бот запущен!")
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
