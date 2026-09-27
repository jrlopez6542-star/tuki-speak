#!/usr/bin/env python3
"""Calcula los hashes SHA-256 de cada <script> en línea de index.html y escribe la misma
Content-Security-Policy en la etiqueta <meta> (GitHub Pages) y en vercel.json (cabeceras HTTP).
Ejecutar después de cualquier cambio en index.html:  python3 tools/build_csp.py"""
import base64, hashlib, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(ROOT, 'index.html')
FB = 'https://www.gstatic.com/firebasejs/12.19.0/'
def policy(hashes, header):
    d = [
        ("default-src", "'self'"),
        ("script-src", "'self' " + ' '.join(f"'sha256-{h}'" for h in hashes) + f" {FB} https://apis.google.com blob:"),
        ("style-src", "'self' 'unsafe-inline'"),
        ("img-src", "'self' data: blob: https://*.googleusercontent.com https://www.google.com"),
        ("media-src", "'self' blob: data:"),
        ("font-src", "'self' data:"),
        ("connect-src", "'self' https://*.googleapis.com wss://generativelanguage.googleapis.com https://*.firebaseapp.com https://www.gstatic.com https://apis.google.com https://www.google.com "
                        "https://api.openai.com https://*.stt.speech.microsoft.com wss://*.stt.speech.microsoft.com https://*.tts.speech.microsoft.com wss://*.tts.speech.microsoft.com "
                        "https://*.api.cognitive.microsoft.com https://*.cognitiveservices.azure.com wss://*.cognitiveservices.azure.com https://api.github.com https://gist.githubusercontent.com"),
        ("frame-src", "https://tuki-speak.firebaseapp.com https://accounts.google.com https://apis.google.com"),
        ("worker-src", "'self' blob:"),
        ("manifest-src", "'self'"),
        ("object-src", "'none'"),
        ("base-uri", "'self'"),
        ("form-action", "'self'"),
    ]
    if header: d.append(("frame-ancestors", "'none'"))
    return '; '.join(f'{k} {v}' for k, v in d)
def main():
    s = open(IDX, encoding='utf-8').read()
    blocks = re.findall(r'<script>(.*?)</script>', s, flags=re.S)
    hashes = [base64.b64encode(hashlib.sha256(b.encode('utf-8')).digest()).decode() for b in blocks]
    meta = f'<meta http-equiv="Content-Security-Policy" content="{policy(hashes, False)}">'
    s2, n = re.subn(r'<meta http-equiv="Content-Security-Policy" content="[^"]*">', meta, s)
    if not n: s2 = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + meta, 1)
    open(IDX, 'w', encoding='utf-8').write(s2)
    headers = [
        {"key": "Content-Security-Policy", "value": policy(hashes, True)},
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
        {"key": "Permissions-Policy", "value": "microphone=(self), camera=(self), geolocation=(), payment=(), usb=(), interest-cohort=()"},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "Cross-Origin-Opener-Policy", "value": "same-origin-allow-popups"},
        {"key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload"},
    ]
    cfg = {"headers": [{"source": "/(.*)", "headers": headers}, {"source": "/sw.js", "headers": [{"key": "Cache-Control", "value": "no-cache"}]}]}
    open(os.path.join(ROOT, 'vercel.json'), 'w').write(json.dumps(cfg, indent=2, ensure_ascii=False) + '\n')
    print(f'{len(hashes)} scripts en línea con hash; CSP escrita en index.html y vercel.json')
if __name__ == '__main__': main()
