<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Приглашение в организацию (студент)</title>
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
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
            color: white;
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
        .token-box {
            background: #f5f3ff;
            border: 2px dashed #8b5cf6;
            border-radius: 12px;
            padding: 18px 24px;
            text-align: center;
            margin: 24px 0;
        }
        .token-box .token {
            font-family: 'Courier New', monospace;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #5b21b6;
            word-break: break-all;
        }
        .telegram-button {
            display: inline-block;
            background: #2AABEE;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            margin-top: 8px;
            box-shadow: 0 6px 18px rgba(42, 171, 238, 0.3);
            transition: transform 0.15s, box-shadow 0.15s;
        }
        .telegram-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(42, 171, 238, 0.4);
        }
        .alternative-text {
            margin-top: 32px;
            padding: 16px 20px;
            background-color: #f5f3ff;
            border-radius: 10px;
            border-left: 4px solid #8b5cf6;
        }
        .alternative-text p {
            margin: 0;
            font-size: 13px;
            color: #4c1d95;
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
            background: linear-gradient(90deg, #8b5cf6, #7c3aed);
            border-radius: 2px;
            margin: 0 auto 32px;
        }
    </style>
</head>
<body>
<div class="email-container">
    <!-- Header -->
    <div class="email-header">
        <div class="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        </div>
        <h1>Приглашение в организацию</h1>
    </div>

    <!-- Body -->
    <div class="email-body">
        <h2>{{ $organizationName }}</h2>
        <div class="divider"></div>
        <p>
            Вы были приглашены в качестве <strong>студента</strong> в организацию <strong>{{ $organizationName }}</strong>.
            Вам не нужно регистрироваться на сайте — используйте Telegram-бота для взаимодействия.
        </p>

        <!-- Токен -->
        <div class="token-box">
            <p style="margin:0 0 8px; font-size:13px; color:#6d28d9; font-weight:500;">ВАШ ПЕРСОНАЛЬНЫЙ ТОКЕН</p>
            <div class="token">{{ $token }}</div>
        </div>

        <p style="margin-bottom: 24px;">
            Скопируйте этот токен и отправьте его нашему боту в Telegram.
        </p>

        <!-- Кнопка / инструкция по боту -->
        @if ($botUrl)
            <div style="text-align: center; margin-bottom: 24px;">
                <a href="{{ $botUrl }}" class="telegram-button">
                    👉 Перейти к боту
                </a>
            </div>
            <p style="margin-bottom: 0;">
                Или вставьте эту ссылку в браузере:<br>
                <a href="{{ $botUrl }}" style="color: #7c3aed; word-break: break-all;">{{ $botUrl }}</a>
            </p>
        @else
            <div class="alternative-text">
                <p>
                    ⚠️ В данный момент Telegram-бот не подключён.
                    Пожалуйста, свяжитесь с администратором организации для получения ссылки на бота.
                </p>
            </div>
        @endif

        <p style="margin-top: 24px;">
            Приглашение действительно до <strong>{{ $expiresAt }}</strong>. Токен одноразовый и не подлежит восстановлению.
        </p>
    </div>

    <!-- Footer -->
    <div class="email-footer">
        <p style="margin: 0 0 6px;">
            &copy; {{ date('Y') }} {{ config('app.name') }}. Все права защищены.
        </p>
        <p style="margin: 0;">
            Это письмо отправлено в рамках приглашения в организацию {{ $organizationName }}.
        </p>
    </div>
</div>
</body>
</html>
