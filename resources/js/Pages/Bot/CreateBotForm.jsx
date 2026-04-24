// resources/js/Components/Organization/CreateOrganizationForm.jsx
import { useForm } from '@inertiajs/react';

export default function CreateBotForm({ onSuccess, organizationId}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        token: '',
        organization_id: organizationId,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('bot.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
        });
    };

    return (
        <form onSubmit={submit} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Новый бот
            </h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Название *
                </label>
                <input
                    type="text"
                    autoFocus
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Обучение пиццамейров"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Токен
                </label>
                <input
                    type="text"
                    value={data.token}
                    onChange={(e) => setData('token', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Можно получить у @BotFather"
                />
                {errors.token && <p className="mt-1 text-sm text-red-600">{errors.token}</p>}
            </div>

            {/* Кнопки */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => onSuccess?.()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200"
                    disabled={processing}
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                >
                    {processing ? 'Создание...' : 'Создать'}
                </button>
            </div>
        </form>
    );
}
