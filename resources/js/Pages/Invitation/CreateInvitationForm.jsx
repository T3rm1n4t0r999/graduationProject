import { useForm } from '@inertiajs/react';

export default function CreateInvitationForm({ onSuccess, organizationId }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        type: 'student',
        expires_at: '',
        limited: true, // По умолчанию ссылка одноразовая (более безопасно)
        organization_id: organizationId,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('invitations.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
        });
    };

    // Функция для переключения значения
    const toggleLimited = () => {
        setData('limited', !data.limited);
    };

    return (
        <form onSubmit={submit} className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                Отправить приглашение
            </h2>

            {/* Email пользователя */}
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email получателя *
                </label>
                <input
                    id="email"
                    type="email"
                    autoFocus
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    placeholder="user@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Тип пользователя (Роль) */}
            <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Роль *
                </label>
                <select
                    id="type"
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                >
                    <option value="student">Ученик</option>
                    <option value="teacher">Учитель</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Переключатель: Одноразовая / Безлимитная */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Тип ссылки
                </label>
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
                    <button
                        type="button"
                        onClick={() => setData('limited', true)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            data.limited
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-950'
                        }`}
                    >
                        Одноразовая
                    </button>
                    <button
                        type="button"
                        onClick={() => setData('limited', false)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            !data.limited
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-950'
                        }`}
                    >
                        Безлимитная
                    </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {data.limited
                        ? 'Ссылка станет неактивной после первого использования.'
                        : 'Ссылкой можно воспользоваться многократно.'}
                </p>
            </div>

            {/* Срок действия (Опционально) */}
            <div className="mb-6">
                <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Срок действия ссылки
                </label>
                <input
                    id="expires_at"
                    type="date"
                    value={data.expires_at}
                    onChange={(e) => setData('expires_at', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Оставьте пустым, чтобы использовать стандартный срок (например, 7 дней).
                </p>
                {errors.expires_at && <p className="mt-1 text-sm text-red-600">{errors.expires_at}</p>}
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => onSuccess?.()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 transition-colors"
                    disabled={processing}
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {processing ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Отправка...
                        </>
                    ) : (
                        'Пригласить'
                    )}
                </button>
            </div>
        </form>
    );
}
