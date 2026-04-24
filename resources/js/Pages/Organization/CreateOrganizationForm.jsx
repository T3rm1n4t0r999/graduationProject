// resources/js/Components/Organization/CreateOrganizationForm.jsx
import { useForm } from '@inertiajs/react';

export default function CreateOrganizationForm({ onSuccess }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('organization.store'), {
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
                Новая организация
            </h2>

            {/* Название */}
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
                    placeholder="ООО «Ромашка»"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Контактный email
                </label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="info@company.ru"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
