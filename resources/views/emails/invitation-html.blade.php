<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Приглашение в организацию</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .email-container {
            max-width: 560px;
            width: 100%;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            margin: 20px auto;
            border: 1px solid #e9eef2;
        }
        .email-header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px 40px;
            text-align: center;
        }
        .email-header .logo-icon {
            width: 56px;
            height: 56px;
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
        }
        .email-header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            letter-spacing: -0.3px;
        }
        .email-body {
            padding: 40px;
        }
        .email-body h2 {
            color: #1a1a2e;
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 12px;
        }
        .email-body p {
            color: #5a5a7a;
            font-size: 15px;
            line-height: 1.7;
            margin: 0 0 24px;
        }
        .accept-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 36px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.2px;
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .accept-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.5);
        }
        .alternative-text {
            margin-top: 32px;
            padding: 16px 20px;
            background-color: #f0fdf4;
            border-radius: 10px;
            border-left: 4px solid #10b981;
        }
        .alternative-text p {
            margin: 0;
            font-size: 13px;
            color: #065f46;
        }
        .alternative-text a {
            color: #059669;
            word-break: break-all;
            font-weight: 500;
        }
        .email-footer {
            text-align: center;
            padding: 20px 40px;
            background-color: #f8fafc;
            border-top: 1px solid #e9eef2;
            color: #9ca3af;
            font-size: 12px;
            line-height: 1.6;
        }
        .divider {
            width: 40px;
            height: 3px;
            background: linear-gradient(90deg, #10b981, #059669);
            border-radius: 2px;
            margin: 0 auto 32px;
        }
    </style>
</head>
<body>
<div class="email-container">
    <div class="email-header">
        <div class="logo-icon">🤝</div>
        <h1>Приглашение в организацию</h1>
    </div>

    <div class="email-body">
        <h2>{{ $organizationName }}</h2>
        <div class="divider"></div>
        <p>
            Вас пригласили присоединиться к организации <strong>{{ $organizationName }}</strong> на платформе {{ config('app.name') }}.
            Чтобы принять приглашение, нажмите кнопку ниже.
        </p>

        <div style="text-align: center; margin: 36px 0 28px;">
            <a href="{{ $acceptUrl }}" class="accept-button">
                ✔ Принять приглашение
            </a>
        </div>

        <p style="margin-bottom: 0;">
            Приглашение действительно до <strong>{{ $expiresAt }}</strong>. Если вы не ожидали этого письма, просто проигнорируйте его.
        </p>

        <div class="alternative-text">
            <p>
                <strong>Кнопка не работает?</strong><br>
                Скопируйте и вставьте эту ссылку в браузер:<br>
                <a href="{{ $acceptUrl }}">{{ $acceptUrl }}</a>
            </p>
        </div>
    </div>

    <div class="email-footer">
        <p style="margin: 0 0 6px;">
            &copy; {{ date('Y') }} {{ config('app.name') }}. Все права защищены.
        </p>
        <p style="margin: 0;">
            Это письмо отправлено на ваш email, потому что кто-то пригласил вас в организацию {{ $organizationName }}.
        </p>
    </div>
</div>
</body>
</html>
