#!/usr/bin/env python3
"""Simple server to receive calculator notifications and send to Telegram"""

import os
import json
import httpx
from http.server import HTTPServer, BaseHTTPRequestHandler

TG_TOKEN = os.getenv("TG_BOT_TOKEN", "8898753323:AAHYeBb626rCRr_ju4CpNoMYl8lUXBx-qBM")
TG_CHAT_ID = os.getenv("TG_CHAT_ID", "425052747")
PORT = 3000

def send_telegram(text):
    url = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
    try:
        httpx.post(url, json={"chat_id": TG_CHAT_ID, "text": text}, timeout=10)
        print(f"[TG] Sent notification")
    except Exception as e:
        print(f"[TG] Error: {e}")

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
            
            if self.path == '/api/lead':
                name = data.get('name', '')
                phone = data.get('phone', '')
                comment = data.get('comment', '')
                form_type = data.get('form', '')
                
                msg = f"📩 Новая заявка!\n\n"
                msg += f"Имя: {name}\n"
                msg += f"Телефон: {phone}\n"
                if comment:
                    msg += f"Комментарий: {comment}\n"
                msg += f"Форма: {form_type}"
                
                send_telegram(msg)
            
            elif self.path == '/api/calc':
                area = data.get('area', 0)
                total = data.get('total', 0)
                floor = data.get('floor', 0)
                radiator = data.get('radiator', 0)
                boiler = data.get('boiler', 0)
                water = data.get('water', 0)
                sewage = data.get('sewage', 0)
                
                msg = f"📊 Расчёт на сайте!\n\n"
                msg += f"Площадь: {area} м²\n"
                msg += f"Стоимость: {total:,} ₽\n\n"
                msg += f"🔥 Тёплый пол: {floor:,} ₽\n"
                msg += f"🔥 Радиаторы: {radiator:,} ₽\n"
                msg += f"🔥 Котельная: {boiler:,} ₽\n"
                msg += f"💧 Водоснабжение: {water:,} ₽\n"
                msg += f"🚰 Канализация: {sewage:,} ₽"
                
                send_telegram(msg)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode())
            
        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == "__main__":
    print(f"🚀 Server started on port {PORT}")
    print(f"📡 Telegram chat: {TG_CHAT_ID}")
    server = HTTPServer(('0.0.0.0', PORT), Handler)
    server.serve_forever()
