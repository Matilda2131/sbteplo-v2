import httpx, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('https://openrouter.ai/api/v1/models', timeout=10)
models = r.json().get('data', [])

# Ищем DeepSeek и другие хорошие модели
for m in models:
    mid = m['id'].lower()
    if any(x in mid for x in ['deepseek', 'qwen', 'gemini', 'gemma', 'llama']):
        price_in = float(m['pricing']['prompt'])
        price_out = float(m['pricing']['completion'])
        if price_out <= 1.0:
            print(f'{m["id"]:55} in:${price_in:.4f} out:${price_out:.4f}')
