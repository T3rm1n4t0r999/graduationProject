import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ErrorPage({ status }) {
    const title = {
        503: 'Сервис недоступен',
        500: 'Ошибка сервера',
        404: 'Страница не найдена',
        403: 'Доступ запрещен',
    }[status] || `Ошибка ${status}`;

    const description = {
        503: 'Извините, мы проводим технические работы. Пожалуйста, зайдите позже.',
        500: 'Что-то пошло не так на наших серверах.',
        404: 'Извините, страница, которую вы ищете, не существует.',
        403: 'У вас нет прав для просмотра этой страницы.',
    }[status] || 'Произошла непредвиденная ошибка.';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-main">
                    {title}
                </h2>
            }
        >
            <Head title={title} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="glass-card p-8 text-center">
                        <div className="flex flex-col items-center">
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                style={{ background: 'var(--color-primary-light)' }}
                            >
                                <svg className="w-10 h-10" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h1 className="text-5xl font-bold text-main mb-4">{status}</h1>
                            <h2 className="text-2xl font-semibold text-main mb-3">{title}</h2>
                            <p className="text-meta max-w-md mb-8">{description}</p>

                            <Link
                                href={route('dashboard')}
                                className="btn-primary"
                            >
                                Вернуться на главную
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
