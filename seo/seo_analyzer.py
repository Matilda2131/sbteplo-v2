import httpx
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def analyze_seo(url):
    """Анализ SEO сайта"""
    results = []
    
    try:
        r = httpx.get(url, timeout=10, follow_redirects=True)
        html = r.text
        
        # Title
        title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        if title_match:
            title = title_match.group(1)
            if len(title) < 30:
                results.append(f"⚠️ Title слишком короткий ({len(title)} символов): {title}")
            elif len(title) > 60:
                results.append(f"⚠️ Title слишком длинный ({len(title)} символов)")
            else:
                results.append(f"✅ Title: {title[:50]}...")
        
        # Description
        desc_match = re.search(r'name="description"\s+content="(.*?)"', html, re.IGNORECASE)
        if desc_match:
            desc = desc_match.group(1)
            if len(desc) < 70:
                results.append(f"⚠️ Description слишком короткий ({len(desc)} символов)")
            elif len(desc) > 160:
                results.append(f"⚠️ Description слишком длинный ({len(desc)} символов)")
            else:
                results.append(f"✅ Description: {len(desc)} символов")
        else:
            results.append("❌ Нет description")
        
        # Keywords
        if 'name="keywords"' in html:
            results.append("✅ Keywords есть")
        else:
            results.append("⚠️ Нет keywords")
        
        # Canonical
        if 'rel="canonical"' in html:
            results.append("✅ Canonical есть")
        else:
            results.append("⚠️ Нет canonical")
        
        # Open Graph
        if 'og:title' in html:
            results.append("✅ Open Graph есть")
        else:
            results.append("⚠️ Нет Open Graph")
        
        # Sitemap
        if 'sitemap.xml' in html:
            results.append("✅ Sitemap ссылка есть")
        else:
            results.append("⚠️ Нет ссылки на sitemap")
        
        # Robots
        if 'robots' in html:
            results.append("✅ Robots meta есть")
        else:
            results.append("⚠️ Нет robots meta")
        
        # H1
        h1_count = len(re.findall(r'<h1[^>]*>', html, re.IGNORECASE))
        if h1_count == 1:
            results.append("✅ H1: 1 заголовок")
        elif h1_count == 0:
            results.append("❌ Нет H1")
        else:
            results.append(f"⚠️ H1: {h1_count} заголовков (нужен 1)")
        
        # Images
        img_count = len(re.findall(r'<img[^>]*>', html, re.IGNORECASE))
        img_without_alt = len(re.findall(r'<img(?![^>]*alt=)[^>]*>', html, re.IGNORECASE))
        if img_without_alt == 0:
            results.append(f"✅ Images: {img_count} с alt")
        else:
            results.append(f"⚠️ Images: {img_without_alt} без alt из {img_count}")
        
        # Page size
        size_kb = len(html) / 1024
        if size_kb > 100:
            results.append(f"⚠️ Размер страницы: {size_kb:.0f} КБ (большой)")
        else:
            results.append(f"✅ Размер страницы: {size_kb:.0f} КБ")
        
        # HTTPS
        if url.startswith('https'):
            results.append("✅ HTTPS")
        else:
            results.append("⚠️ HTTP (нужен HTTPS)")
        
    except Exception as e:
        results.append(f"❌ Ошибка: {str(e)[:60]}")
    
    return results

if __name__ == "__main__":
    urls = [
        "http://sbteplo.ru",
        "https://matilda2131.github.io/sbteplo-v2/"
    ]
    
    for url in urls:
        print(f"\n{'='*50}")
        print(f"АНАЛИЗ: {url}")
        print('='*50)
        results = analyze_seo(url)
        for r in results:
            print(r)
