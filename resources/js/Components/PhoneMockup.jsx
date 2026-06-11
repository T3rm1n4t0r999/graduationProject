export default function PhoneMockup() {
    const messages = [
        { from: 'user', text: 'Мой профиль' },
        {
            from: 'bot',
            text: 'Ваш профиль:\n\nИмя: Мтв\nБаллы: 7',
            inlineButtons: [
                [{ text: 'Таблица лидеров' }]
            ]
        },
        {
            from: 'bot',
            text: 'Что из перечисленного является признаком фишингового письма?\n\n1: Неизвестный отправитель\n2: Срочный призыв к действию',
            inlineButtons: [
                [{ text: '1' }, { text: '2' }],
                [{ text: '← Предыдущий' }, { text: 'Следующий →' }],
                [{ text: 'Отвечено: 0/2' }, { text: 'Заново' }, { text: 'К заданию' }]
            ]
        }
    ];

    return (
        <div className="relative mx-auto w-[320px] sm:w-[320px]">
            {/* Корпус телефона */}
            <div className="rounded-[3rem] border-4 border-gray-800 bg-gray-900 p-2 shadow-2xl">
                {/* Динамик */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-800 rounded-b-xl z-10" />

                {/* Экран */}
                <div className="rounded-[2.5rem] overflow-hidden h-[500px] sm:h-[560px] flex flex-col"
                     style={{ backgroundColor: '#E5DDD5' }}>

                    {/* Статус-бар (белая полоса) */}
                    <div className="bg-white pt-8 pb-2 px-4 flex justify-between items-center text-xs font-medium text-gray-500">
                        <span>9:41</span>
                        <span>EduBot</span>
                        <span>📶 🔋</span>
                    </div>

                    {/* Заголовок чата */}
                    <div className="bg-white px-4 py-2 flex items-center gap-3 border-b border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">E</div>
                        <div>
                            <p className="text-sm font-semibold text-black">EduBot</p>
                            <p className="text-xs text-gray-500">online</p>
                        </div>
                    </div>

                    {/* Область сообщений */}
                    <div
                        className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #C4B9A8 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            backgroundColor: '#E5DDD5',
                        }}
                    >
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {/* Фиксированная ширина для сообщения и инлайн-кнопок */}
                                <div style={{ width: '240px' }}>
                                    {/* Само сообщение */}
                                    <div
                                        className="px-3 py-2 rounded-2xl text-sm w-full"
                                        style={{
                                            backgroundColor: msg.from === 'user' ? '#E1FFC7' : '#FFFFFF',
                                            color: '#000',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                            whiteSpace: 'pre-wrap',
                                            borderRadius: msg.from === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                    {/* Инлайн-кнопки под сообщением */}
                                    {msg.inlineButtons && (
                                        <div className="mt-1 space-y-1 w-full">
                                            {msg.inlineButtons.map((row, rowIdx) => (
                                                <div key={rowIdx} className="flex gap-1">
                                                    {row.map((btn, btnIdx) => (
                                                        <button
                                                            key={btnIdx}
                                                            className="flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-colors"
                                                            style={{
                                                                backgroundColor: '#F1F1F1',
                                                                color: '#000',
                                                            }}
                                                        >
                                                            {btn.text}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Нижнее меню */}
                    <div className="bg-white border-t border-gray-200 px-3 py-4">
                        <div className="grid grid-cols-2 gap-1 mb-1">
                            <button className="flex flex-col items-center justify-center py-1.5 rounded-lg"
                                    style={{ backgroundColor: '#F1F1F1' }}>
                                <span className="text-[10px] text-gray-600">Профиль</span>
                            </button>
                            <button className="flex flex-col items-center justify-center py-1.5 rounded-lg"
                                    style={{ backgroundColor: '#F1F1F1' }}>
                                <span className="text-[10px] text-gray-600">Результаты</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            <button className="flex flex-col items-center justify-center py-1.5 rounded-lg"
                                    style={{ backgroundColor: '#F1F1F1' }}>
                                <span className="text-[10px] text-gray-600">Курсы</span>
                            </button>
                            <button className="flex flex-col items-center justify-center py-1.5 rounded-lg"
                                    style={{ backgroundColor: '#F1F1F1' }}>
                                <span className="text-[10px] text-gray-600">ДЗ</span>
                            </button>
                            <button className="flex flex-col items-center justify-center py-1.5 rounded-lg"
                                    style={{ backgroundColor: '#F1F1F1' }}>
                                <span className="text-[10px] text-gray-600">Контр.</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Боковые кнопки */}
            <div className="absolute top-24 -left-1 w-1 h-8 bg-gray-700 rounded-l-md" />
            <div className="absolute top-32 -left-1 w-1 h-12 bg-gray-700 rounded-l-md" />
            <div className="absolute top-24 -right-1 w-1 h-12 bg-gray-700 rounded-r-md" />
        </div>
    );
}
