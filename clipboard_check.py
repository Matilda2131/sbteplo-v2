import subprocess
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def get_clipboard():
    """Чтение буфера обмена"""
    try:
        result = subprocess.run(
            ['powershell', '-command', 'Get-Clipboard'],
            capture_output=True, text=True, timeout=5
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Ошибка: {e}"

if __name__ == "__main__":
    content = get_clipboard()
    print("=== БУФЕР ОБМЕНА ===")
    print(content)
