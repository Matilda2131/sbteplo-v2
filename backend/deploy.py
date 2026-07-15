#!/usr/bin/env python3
"""Deploy to Render via API"""

import httpx
import json
import time

# RENDER_API_KEY = input("Вставь Render API Key: ").strip()
RENDER_API_KEY = ""  # Заполнить!

if not RENDER_API_KEY:
    print("❌ Нужен Render API Key!")
    print()
    print("Как получить:")
    print("1. Зайди на https://dashboard.render.com/u/settings#api-keys")
    print("2. Нажми 'Create API Key'")
    print("3. Скопируй ключ и вставь сюда")
    exit(1)

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Content-Type": "application/json"
}

# Create service
print("🔧 Создаю сервис...")
service_data = {
    "type": "background_worker",
    "name": "mimo-notify",
    "repo": "https://github.com/Matilda2131/sbteplo-v2.git",
    "branch": "main",
    "buildCommand": "cd backend && pip install -r requirements.txt",
    "startCommand": "cd backend && python notify_server.py",
    "env": "python",
    "envVars": [
        {"key": "TG_BOT_TOKEN", "value": "8898753323:AAHYeBb626rCRr_ju4CpNoMYl8lUXBx-qBM"},
        {"key": "TG_CHAT_ID", "value": "425052747"},
        {"key": "DEEPSEEK_KEY", "value": "sk-e572243c595540e5a9331a348e4d326c"}
    ]
}

resp = httpx.post("https://api.render.com/v1/services", headers=headers, json=service_data)
if resp.status_code in [200, 201]:
    service = resp.json()
    service_id = service["id"]
    print(f"✅ Сервис создан: {service_id}")
    
    # Trigger deploy
    print("🚀 Запускаю деплой...")
    deploy_resp = httpx.post(f"https://api.render.com/v1/services/{service_id}/deploys", headers=headers)
    if deploy_resp.status_code in [200, 201]:
        print("✅ Деплой запущен!")
        print(f"⏳ Ожидание (2-3 минуты)...")
        
        # Wait for deploy
        for i in range(30):
            time.sleep(10)
            status_resp = httpx.get(f"https://api.render.com/v1/services/{service_id}", headers=headers)
            if status_resp.ok:
                status = status_resp.json().get("service", {}).get("status", "")
                print(f"  Статус: {status}")
                if status == "live":
                    url = status_resp.json().get("service", {}).get("serviceDetails", {}).get("url", "")
                    print(f"\n🎉 Готово!")
                    print(f"URL: {url}")
                    print(f"\nОбнови BACKEND_URL в index.html на: {url}")
                    break
    else:
        print(f"❌ Ошибка деплоя: {deploy_resp.status_code}")
        print(deploy_resp.text)
else:
    print(f"❌ Ошибка создания сервиса: {resp.status_code}")
    print(resp.text)
