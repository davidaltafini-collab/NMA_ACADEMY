<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codul tău de verificare</title>
    <style>
        body { margin: 0; padding: 0; background: #0f0f13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .wrapper { max-width: 480px; margin: 40px auto; background: #18181f; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px 40px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .logo { font-size: 20px; font-weight: 900; color: #8b5cf6; letter-spacing: -0.5px; }
        .body { padding: 32px 40px; }
        .greeting { color: #e5e5ea; font-size: 16px; margin: 0 0 16px; }
        .description { color: #8e8e99; font-size: 14px; line-height: 1.6; margin: 0 0 28px; }
        .code-label { color: #8e8e99; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px; }
        .code-box { display: inline-block; background: #0f0f13; border: 1px solid #8b5cf6; border-radius: 8px; padding: 16px 32px; margin-bottom: 28px; }
        .code { font-size: 32px; font-weight: 700; color: #a78bfa; letter-spacing: 8px; font-family: 'Courier New', monospace; }
        .expiry { color: #8e8e99; font-size: 13px; margin: 0 0 28px; }
        .expiry strong { color: #e5e5ea; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 28px 0; }
        .disclaimer { color: #5c5c6b; font-size: 12px; line-height: 1.5; margin: 0; }
        .footer { background: #111116; padding: 20px 40px; text-align: center; }
        .footer-text { color: #3d3d4d; font-size: 12px; margin: 0; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div class="logo">NMA</div>
        </div>
        <div class="body">
            <p class="greeting">Bună, {{ $userName }}!</p>
            <p class="description">
                Ai solicitat crearea unui cont pe <strong style="color:#e5e5ea">NMA Academy</strong>.
                Folosește codul de mai jos pentru a-ți verifica adresa de email.
            </p>

            <p class="code-label">Codul tău de verificare</p>
            <div class="code-box">
                <div class="code">{{ $code }}</div>
            </div>

            <p class="expiry">
                Codul este valabil <strong>1 oră</strong> de la primirea acestui email.
            </p>

            <hr class="divider">

            <p class="disclaimer">
                Dacă nu ai solicitat crearea unui cont, poți ignora acest email în siguranță.
                Nimeni nu a accesat contul tău.
            </p>
        </div>
        <div class="footer">
            <p class="footer-text">© {{ date('Y') }} NMA Academy. Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>
