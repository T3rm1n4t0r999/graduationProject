import WelcomeLayout from '@/Layouts/WelcomeLayout';
import { Head, Link } from '@inertiajs/react';

const steps = [
    {
        step: 1,
        title: 'Зарегистрируйтесь и подтвердите почту',
        description:
            'Нажмите «Начать бесплатно» на главной, заполните форму регистрации. После подтверждения email вы попадёте в личный кабинет и сможете создать первую организацию.',
    },
    {
        step: 2,
        title: 'Создайте организацию',
        description:
            'В панели управления нажмите «Создать организацию», укажите название. Вы станете владельцем организации и получите доступ к консоли управления обучением.',
    },
    {
        step: 3,
        title: 'Подключите Telegram бота',
        description:
            'Создайте бота через @BotFather в Telegram, получите API-токен. В настройках организации добавьте бота: вставьте токен и задайте имя. Бот станет «учителем» для ваших сотрудников.',
    },
    {
        step: 4,
        title: 'Постройте учебную программу',
        description:
            'В консоли управления создайте курс, внутри него модули, уроки и практические задания с вопросами (выбор ответа, текстовый или свободный ответ). При необходимости добавьте материалы.',
    },
    {
        step: 5,
        title: 'Назначьте студентов',
        description:
            'В разделе «Студенты» вы увидите всех, кто зарегистрировался в боте. Назначьте им курсы вручную или объедините студентов в группы и назначьте курс всей группе.',
    },
    {
        step: 6,
        title: 'Контролируйте обучение',
        description:
            'Сотрудники проходят задания прямо в Telegram. Вы можете отслеживать прогресс каждого, проверять ответы на «свободные» вопросы и видеть общую статистику на дашборде.',
    },
    {
        step: 7,
        title: 'Автоматические домашние задания и экзамены',
        description:
            'Домашние задания становятся доступны студенту сразу после выполнения всех заданий урока. Контрольные работы – после прохождения всех уроков модуля. Назначать их вручную не нужно.',
    },
];

const faq = [
    {
        q: 'Сколько организаций я могу создать?',
        a: 'До трёх организаций на одном аккаунте.',
    },
    {
        q: 'Могу ли я добавить несколько ботов?',
        a: 'Каждая организация может иметь только одного бота.',
    },
    {
        q: 'Какие роли существуют?',
        a: 'Владелец (полный доступ), Менеджер (управление без удаления организации), Учитель (создание контента и просмотр прогресса), Сотрудник (только Telegram).',
    },
    {
        q: 'Как студенты попадают в систему?',
        a: 'Они начинают диалог с ботом в Telegram, бот автоматически регистрирует их в вашей организации.',
    },
];

export default function Guide({ auth }) {
    return (
        <WelcomeLayout auth={auth}>
            <Head title="Как пользоваться платформой" />

            {/* Hero */}
            <section className="py-16 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <h1 className="text-4xl font-bold text-main mb-6">
                        Как работает EduBot
                    </h1>
                    <p className="text-lg text-meta max-w-xl mx-auto">
                        Пошаговое руководство по настройке обучения сотрудников через Telegram
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="pb-20">
                <div className="max-w-4xl mx-auto px-6 space-y-8">
                    {steps.map((step) => (
                        <div key={step.step} className="glass-card p-6 md:p-8 flex gap-6">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
                                style={{ background: 'var(--color-primary)' }}
                            >
                                {step.step}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-main mb-2">{step.title}</h3>
                                <p className="text-meta leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16" style={{ background: 'var(--color-bg-secondary, rgba(0,0,0,0.02))' }}>
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-main text-center mb-10">Часто задаваемые вопросы</h2>
                    <div className="space-y-4">
                        {faq.map((item, i) => (
                            <div key={i} className="glass-card p-5">
                                <p className="font-semibold text-main mb-1">{item.q}</p>
                                <p className="text-meta text-sm">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-12 text-center">
                {!auth.user && (
                    <div className="max-w-md mx-auto px-6">
                        <p className="text-meta mb-4">Готовы начать?</p>
                        <Link href="/register" className="btn-primary">
                            Создать аккаунт
                        </Link>
                    </div>
                )}
            </section>
        </WelcomeLayout>
    );
}
