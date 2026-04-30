import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ErrorPage({ status }) {
    const title = {
        503: 'Сервис недоступен',
        500: 'Ошибка сервера',
        404: 'Страница не найдена',
        403: 'Доступ запрещен',
    }[status];

    const description = {
        503: 'Извините, мы проводим технические работы. Пожалуйста, зайдите позже.',
        500: 'Что-то пошло не так на наших серверах.',
        404: 'Извините, страница, которую вы ищете, не существует.',
        403: 'У вас нет прав для просмотра этой страницы.',
    }[status];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {title}
                </h2>
            }
        >
            <Head title={title} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex flex-col items-center justify-center py-10">
                                <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
                                    {status}
                                </h1>
                                <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                                    {description}
                                </p>

                                <a
                                    href="/dashboard"
                                    className="mt-8 inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Вернуться на главную
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
