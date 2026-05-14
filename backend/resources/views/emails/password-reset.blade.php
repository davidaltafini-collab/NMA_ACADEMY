<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resetarea parolei</title>
    <style>
        body { margin: 0; padding: 0; background: #0f0f13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .wrapper { max-width: 480px; margin: 40px auto; background: #18181f; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px 40px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .logo { font-size: 20px; font-weight: 900; color: #8b5cf6; letter-spacing: -0.5px; }
        .body { padding: 32px 40px; }
        .greeting { color: #e5e5ea; font-size: 16px; margin: 0 0 16px; }
        .description { color: #8e8e99; font-size: 14px; line-height: 1.6; margin: 0 0 28px; }
        .btn-wrap { margin-bottom: 28px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; letter-spacing: 0.2px; }
        .link-fallback-label { color: #8e8e99; font-size: 12px; margin: 0 0 8px; }
        .link-fallback { word-break: break-all; color: #8b5cf6; font-size: 12px; font-family: 'Courier New', monospace; }
        .expiry { color: #8e8e99; font-size: 13px; margin: 20px 0 0; }
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
                Ai solicitat resetarea parolei pentru contul tău de pe
                <strong style="color:#e5e5ea">NMA Academy</strong>.
                Apasă butonul de mai jos pentru a seta o parolă nouă.
            </p>

            <div class="btn-wrap">
                <a href="{{ $resetUrl }}" class="btn">Resetează Parola</a>
            </div>

            <p class="link-fallback-label">Sau copiază link-ul în browser:</p>
            <p class="link-fallback">{{ $resetUrl }}</p>

            <p class="expiry">
                Link-ul este valabil <strong>1 oră</strong> de la primirea acestui email.
                După expirare, va trebui să soliciți un nou link.
            </p>

            <hr class="divider">

            <p class="disclaimer">
                Dacă nu ai solicitat resetarea parolei, poți ignora acest email în siguranță.
                Parola ta nu a fost modificată și contul rămâne protejat.
            </p>
        </div>
        <div class="footer">
            <p class="footer-text">© {{ date('Y') }} NMA Academy. Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>
