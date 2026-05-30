export default function TelegramPreview({ question, totalQuestions = 1 }) {
    const options = question.options || [];
    const type = question.question_type;
    const currentIndex = 0;
    const answeredCount = 0;

    const questionText = question.question.length > 150
        ? question.question.slice(0, 150) + '…'
        : question.question;

    const messageLines = [
        `Вопрос ${currentIndex + 1}/${totalQuestions}:`,
        '',
        questionText,
    ];

    if (type === 'single_choice' || type === 'multiple_choice') {
        options.forEach((opt, idx) => {
            const label = opt.text.length > 40 ? opt.text.slice(0, 40) + '…' : opt.text;
            messageLines.push(`${idx + 1}: ${label}`);
        });
    }

    const messageText = messageLines.join('\n');

    return (
        <div className="glass-card p-5 md:p-7">
            <h2 className="text-lg font-semibold text-main mb-5 flex items-center gap-2">
                Предпросмотр в Telegram
            </h2>

            <div
                className="rounded-2xl p-4 shadow-inner relative overflow-hidden"
                style={{
                    background: 'var(--tg-bg)',
                    border: '1px solid var(--color-border)',
                }}
            >
                {/* Паттерн точек как в Telegram */}
                <div
                    className="absolute inset-0 opacity-10 dark:opacity-5"
                    style={{
                        backgroundImage: 'radial-gradient(circle, var(--tg-pattern-dot) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />

                <div className="flex justify-start relative z-10">
                    <div

                        className="relative rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm w-full"
                        style={{
                            background: 'var(--tg-bubble)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        {question.image && (
                            <div className="mb-3">
                                <img
                                    src={question.image.url}
                                    alt={question.image.name || 'Изображение вопроса'}
                                    className="w-full h-auto object-cover rounded-lg"
                                    loading="lazy"
                                />
                            </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                            {messageText}
                        </p>

                        {(type === 'single_choice' || type === 'multiple_choice') && options.length > 0 && (
                            <div className="mt-3 flex flex-col gap-2 w-full">
                                {options.map((opt, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium select-none w-full"
                                        style={{
                                            background: 'var(--tg-button)',
                                            color: 'var(--color-text-primary)',
                                        }}
                                    >
                                        <span>{type === 'single_choice' ? '⚪' : '◻️'}</span>
                                        <span className="flex-1 break-words truncate">
                                            {idx + 1}. {opt.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(type === 'text' || type === 'free_text') && (
                            <div className="mt-3">
                                <div
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium select-none w-full"
                                    style={{
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                    }}
                                >
                                    <span>✍️</span>
                                    <span>Ввести ответ текстом</span>
                                </div>
                            </div>
                        )}

                        {totalQuestions > 1 && (
                            <div className="flex gap-2 items-center mt-3 w-full">
                                <div
                                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm select-none"
                                    style={{
                                        background: 'var(--tg-button)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    ← Предыдущий
                                </div>
                                <div
                                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-bold"
                                    style={{
                                        background: 'var(--tg-button)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                >
                                    {currentIndex + 1}/{totalQuestions}
                                </div>
                                <div
                                    className="flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm select-none"
                                    style={{
                                        background: 'var(--tg-button)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    Следующий →
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 mt-3 w-full">
                            <div
                                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs"
                                style={{
                                    background: 'var(--tg-button)',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                📊 {answeredCount}/{totalQuestions}
                            </div>
                            <div
                                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs select-none"
                                style={{
                                    background: 'var(--tg-button)',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                🔄 Начать заново
                            </div>
                            <div
                                className="flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs select-none"
                                style={{
                                    background: 'var(--tg-button)',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                ↩ К заданию
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-xs text-meta mt-3 leading-relaxed">
                Полный предпросмотр отображения в Telegram‑боте, включая навигацию по вопросам и контрольные кнопки.
            </p>
        </div>
    );
}
