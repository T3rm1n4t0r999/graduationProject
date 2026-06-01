import { useForm } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function CreateGroupInvitationForm({ isOpen, onClose, onSuccess, organization, group }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        limited: true,
        expires_at: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('group.invitation.store', { organization: organization.id, group: group.data.id }), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
        });
    };

    const handleClose = () => {
        if (!processing) onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all relative z-10">
                                <Dialog.Title as="h3" className="text-lg font-medium text-main mb-4">
                                    Создать приглашение в группу «{group.name}»
                                </Dialog.Title>

                                <form onSubmit={submit}>
                                    {/* Email */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main">Email получателя *</label>
                                        <input
                                            type="email"
                                            autoFocus
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="user@example.com"
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                    </div>

                                    {/* Тип ссылки */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main mb-2">Тип ссылки</label>
                                        <div className="flex items-center p-1 rounded-lg" style={{ background: 'var(--color-border-light)' }}>
                                            <button
                                                type="button"
                                                onClick={() => setData('limited', true)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                                    data.limited
                                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                        : 'text-meta hover:text-main'
                                                }`}
                                            >
                                                Одноразовая
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('limited', false)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                                    !data.limited
                                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                        : 'text-meta hover:text-main'
                                                }`}
                                            >
                                                Безлимитная
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-meta">
                                            {data.limited
                                                ? 'Токен станет неактивным после использования.'
                                                : 'Токен можно использовать многократно.'}
                                        </p>
                                    </div>

                                    {/* Срок действия */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-main">Срок действия</label>
                                        <input
                                            type="date"
                                            value={data.expires_at}
                                            onChange={(e) => setData('expires_at', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <p className="mt-1 text-xs text-meta">
                                            Оставьте пустым, чтобы токен не имел ограничения по времени.
                                        </p>
                                        {errors.expires_at && <p className="mt-1 text-sm text-red-500">{errors.expires_at}</p>}
                                    </div>

                                    {/* Кнопки */}
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="btn-ghost"
                                            disabled={processing}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            {processing ? (
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            ) : null}
                                            {processing ? 'Создание...' : 'Создать приглашение'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
