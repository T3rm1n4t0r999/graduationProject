<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Подтверждение Email</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #ffffff;
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
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 36px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.2px;
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5);
        }
        .alternative-text {
            margin-top: 32px;
            padding: 16px 20px;
            background-color: #f8fafc;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .alternative-text p {
            margin: 0;
            font-size: 13px;
            color: #6b7280;
        }
        .alternative-text a {
            color: #667eea;
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
        .email-footer a {
            color: #667eea;
            text-decoration: none;
        }
        .divider {
            width: 40px;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
                <path d="M5.5 17L2 12l3.5-5"/>
                <path d="M18.5 17L22 12l-3.5-5"/>
            </svg>
        </div>
        <h1>Добро пожаловать в {{ config('app.name', 'Наше Приложение') }}!</h1>
    </div>

    <!-- Body -->
    <div class="email-body">
        <h2>Подтвердите ваш email</h2>
        <div class="divider"></div>
        <p>
            Спасибо за регистрацию! Чтобы завершить создание аккаунта и получить доступ ко всем возможностям, пожалуйста, подтвердите ваш адрес электронной почты.
        </p>

        <!-- Основная кнопка подтверждения -->
        <div style="text-align: center; margin: 36px 0 28px;">
            <a href="{{ $url }}" class="verify-button">
                ✅ Подтвердить email
            </a>
        </div>

        <p style="margin-bottom: 0;">
            Эта ссылка действительна в течение <strong>60 минут</strong>. Если вы не создавали аккаунт на нашем сайте, просто проигнорируйте это письмо.
        </p>

        <!-- Альтернативный способ -->
        <div class="alternative-text">
            <p>
                <strong>Кнопка не работает?</strong><br>
                Скопируйте и вставьте эту ссылку в браузер:<br>
                <a href="{{ $url }}">{{ $url }}</a>
            </p>
        </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
        <p style="margin: 0 0 6px;">
            &copy; {{ date('Y') }} {{ config('app.name', 'Наше Приложение') }}. Все права защищены.
        </p>
        <p style="margin: 0;">
            Вы получили это письмо, потому что зарегистрировались на сайте
            <a href="{{ config('app.url') }}">{{ config('app.url') }}</a>
        </p>
    </div>
</div>
</body>
</html>
