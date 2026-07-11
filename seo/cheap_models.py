import httpx, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('https://openrouter.ai/api/v1/models', timeout=10)
models = r.json().get('data', [])

cheap = []
for m in models:
    price_in = float(m['pricing']['prompt'])
    price_out = float(m['pricing']['completion'])
    if price_out <= 0.5:
        cheap.append({
            'id': m['id'],
            'price_in': price_in,
            'price_out': price_out,
        })

cheap.sort(key=lambda x: x['price_out'])
print('=== Дешёвые модели (до $0.50 за 1M output) ===')
for m in cheap[:20]:
    mid = m['id']
    pin = m['price_in']
    pout = m['price_out']
    print(f'{mid:55} in:${pin:.5f} out:${pout:.5f}')
