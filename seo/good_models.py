import httpx, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = httpx.get('https://openrouter.ai/api/v1/models', timeout=10)
models = r.json().get('data', [])

# Ищем хорошие модели до $2 за 1M output
good = []
for m in models:
    price_in = float(m['pricing']['prompt'])
    price_out = float(m['pricing']['completion'])
    if 0 < price_out <= 2.0:
        good.append({
            'id': m['id'],
            'price_in': price_in,
            'price_out': price_out,
        })

good.sort(key=lambda x: x['price_out'])
print('=== Хорошие модели (до $2 за 1M output) ===')
for m in good[:25]:
    mid = m['id']
    pin = m['price_in']
    pout = m['price_out']
    print(f'{mid:55} in:${pin:.4f} out:${pout:.4f}')
