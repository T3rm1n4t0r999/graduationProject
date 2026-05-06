import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ bot, organization }) {
    const { data, setData, put, processing, errors } = useForm({
        name: bot.name || '',
        token: '',
        bot_url: bot.bot_url || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('bot.update', bot.id), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('organization.show', organization.id)}
                        className="btn-ghost inline-flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Назад к организации
                    </Link>
                    <div className="h-6 w-px" style={{ background: 'var(--color-border)' }}></div>
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-xl"
                            style={{ background: 'var(--color-primary)' }}
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-main">Редактирование бота</h1>
                            <p className="text-sm text-meta">{organization.name}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Редактирование ${bot.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="glass-card overflow-hidden">
                        <div
                            className="px-6 py-5 border-b"
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                                    style={{ background: 'var(--color-primary-light)' }}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        style={{ color: 'var(--color-primary)' }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-main">Настройки бота</h2>
                                    <p className="text-sm text-meta">Измените название и токен бота</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-main mb-2">Название бота *</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="form-input-glass"
                                    placeholder="Например: Помощник для клиентов"
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-main mb-2">Ссылка на бота *</label>
                                <input
                                    type="text"
                                    value={data.bot_url}
                                    onChange={(e) => setData('bot_url', e.target.value)}
                                    className="form-input-glass"
                                    placeholder="@ВашБот"
                                />
                                {errors.bot_url && (
                                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.bot_url}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-main mb-2">Токен бота</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.token}
                                        onChange={(e) => setData('token', e.target.value)}
                                        className="form-input-glass pr-12"
                                        placeholder="Оставьте пустым, чтобы не менять"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-meta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-meta flex items-start gap-1.5">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Оставьте поле пустым, если не хотите менять токен. Токен можно получить у @BotFather в Telegram.
                                </p>
                                {errors.token && (
                                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.token}
                                    </p>
                                )}
                            </div>

                            <div
                                className="rounded-xl p-4 border"
                                style={{
                                    background: 'var(--color-bg-card)',
                                    borderColor: 'var(--color-border)',
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex items-center justify-center w-8 h-8 rounded-lg"
                                        style={{ background: 'var(--color-primary-light)' }}
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            style={{ color: 'var(--color-primary)' }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-main">Текущий статус</p>
                                        <p className="text-sm text-meta">
                                            Бот сейчас:{' '}
                                            <span className={`font-semibold ${bot.is_active ? 'text-green-600 dark:text-green-400' : 'text-meta'}`}>
                                                {bot.is_active ? 'Активен' : 'Не активен'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <Link
                                    href={route('organization.show', organization.id)}
                                    className="btn-ghost"
                                >
                                    Отмена
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-primary"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Сохранение...
                                        </span>
                                    ) : (
                                        'Сохранить изменения'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-6 rounded-xl p-4 border"
                         style={{
                             background: 'var(--color-primary-light)',
                             borderColor: 'var(--color-primary)',
                         }}>
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-semibold text-main">Важно о безопасности</h4>
                                <p className="mt-1 text-sm text-meta">
                                    Никогда не передавайте токен бота третьим лицам. При компрометации токена немедленно сгенерируйте новый у @BotFather.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
