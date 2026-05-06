<!DOCTYPE html>
<html lang="ru" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Подтвердите организацию</title>
    <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
    <style>
        * { margin:0; padding:0; font-family:'Segoe UI', Arial, sans-serif; }
        body { width:100%; background-color:#f4f7fa; margin:0; padding:0; }
        table { border-collapse:collapse; }
        img { border:0; outline:none; text-decoration:none; }
    </style>
</head>
<body style="background-color:#f4f7fa;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fa;">
    <tr>
        <td align="center" style="padding:40px 20px;">
            <!-- Карточка письма -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
                <!-- Шапка с логотипом / иконкой -->
                <tr>
                    <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:12px 12px 0 0; padding:40px 30px; text-align:center;">
                        <div style="font-size:48px; line-height:1;">🏢</div>
                        <h1 style="color:#ffffff; font-size:26px; font-weight:700; margin-top:12px;">Подтвердите организацию</h1>
                    </td>
                </tr>
                <!-- Тело карточки -->
                <tr>
                    <td style="background-color:#ffffff; border-radius:0 0 12px 12px; padding:40px 30px 30px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                        <!-- Приветствие -->
                        <p style="font-size:16px; color:#2d3748; margin-bottom:16px; line-height:1.6;">
                            Здравствуйте!
                        </p>
                        <p style="font-size:16px; color:#2d3748; margin-bottom:24px; line-height:1.6;">
                            Вы создали организацию <strong style="color:#1a202c;">«{{ $organizationName }}»</strong> в {{ config('app.name') }}.
                            Чтобы активировать полный функционал, подтвердите, что этот email принадлежит вам.
                        </p>

                        <!-- CTA-кнопка -->
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:32px 0;">
                            <tr>
                                <td align="center" style="background-color:#4f46e5; border-radius:8px; padding:16px 32px;">
                                    <a href="{{ $verificationUrl }}" target="_blank" style="font-size:18px; font-weight:600; color:#ffffff; text-decoration:none; display:inline-block;">
                                        Подтвердить организацию
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <!-- Что вы получите -->
                        <h2 style="font-size:20px; color:#1a202c; margin-bottom:16px;">Что вы получите после подтверждения:</h2>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                            <tr>
                                <td style="vertical-align:top; padding:6px 12px 6px 0; font-size:18px;">✅</td>
                                <td style="vertical-align:top; padding:6px 0; font-size:16px; color:#4a5568;">Создание и управление ботами</td>
                            </tr>
                            <tr>
                                <td style="vertical-align:top; padding:6px 12px 6px 0; font-size:18px;">✅</td>
                                <td style="vertical-align:top; padding:6px 0; font-size:16px; color:#4a5568;">Приглашение пользователей в организацию</td>
                            </tr>
                            <tr>
                                <td style="vertical-align:top; padding:6px 12px 6px 0; font-size:18px;">✅</td>
                                <td style="vertical-align:top; padding:6px 0; font-size:16px; color:#4a5568;">Доступ к админ-панели</td>
                            </tr>
                            <tr>
                                <td style="vertical-align:top; padding:6px 12px 6px 0; font-size:18px;">✅</td>
                                <td style="vertical-align:top; padding:6px 0; font-size:16px; color:#4a5568;">Полная аналитика и настройки</td>
                            </tr>
                        </table>

                        <!-- Срок действия -->
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0fff4; border-left:4px solid #48bb78; border-radius:6px; margin-bottom:24px;">
                            <tr>
                                <td style="padding:16px 20px; font-size:15px; color:#22543d;">
                                    ⏱ Ссылка действительна <strong>24 часа</strong>.
                                </td>
                            </tr>
                        </table>

                        <p style="font-size:15px; color:#718096; margin-bottom:24px; line-height:1.5;">
                            Если вы не создавали эту организацию — просто проигнорируйте письмо.
                        </p>

                        <!-- Подпись -->
                        <p style="font-size:16px; color:#2d3748; margin-bottom:4px;">
                            С уважением,
                        </p>
                        <p style="font-size:16px; color:#2d3748; font-weight:600;">
                            Команда {{ config('app.name') }}
                        </p>
                    </td>
                </tr>
                <!-- Футер с технической ссылкой -->
                <tr>
                    <td style="padding:20px 30px; text-align:center;">
                        <p style="font-size:13px; color:#a0aec0; line-height:1.6;">
                            Если кнопка не работает, скопируйте ссылку и откройте в браузере:<br>
                            <a href="{{ $verificationUrl }}" style="color:#4f46e5; word-break:break-all;">{{ $verificationUrl }}</a>
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
