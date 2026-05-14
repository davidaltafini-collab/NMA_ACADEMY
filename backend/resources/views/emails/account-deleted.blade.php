<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contul tau a fost sters</title>
    <style>
        body { margin: 0; padding: 0; background: #0f0f13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .wrapper { max-width: 480px; margin: 40px auto; background: #18181f; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px 40px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .logo { font-size: 20px; font-weight: 900; color: #8b5cf6; letter-spacing: -0.5px; }
        .body { padding: 32px 40px; }
        .greeting { color: #e5e5ea; font-size: 16px; margin: 0 0 16px; }
        .description { color: #8e8e99; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
        .notice-box { background: #1a1a2e; border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
        .notice-text { color: #f87171; font-size: 13px; line-height: 1.6; margin: 0; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 24px 0; }
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
                Contul tău de pe <strong style="color:#e5e5ea">NMA Academy</strong> a fost
                <strong style="color:#f87171">șters cu succes</strong> la solicitarea ta.
            </p>

            <div class="notice-box">
                <p class="notice-text">
                    Accesul la cont și la toate cursurile asociate a fost revocat.
                    Sesiunile active au fost deconectate.
                </p>
            </div>

            <p class="description">
                Dacă dorești să revii în comunitatea NMA Academy în viitor,
                ne poți contacta pentru reactivarea contului sau poți crea un cont nou.
            </p>

            <hr class="divider">

            <p class="disclaimer">
                Dacă nu ai solicitat ștergerea contului și crezi că cineva a accesat contul tău,
                contactează-ne imediat la suport. Datele tale nu au fost șterse permanent
                și contul poate fi recuperat de echipa noastră.
            </p>
        </div>
        <div class="footer">
            <p class="footer-text">© {{ date('Y') }} NMA Academy. Toate drepturile rezervate.</p>
        </div>
    </div>
</body>
</html>
