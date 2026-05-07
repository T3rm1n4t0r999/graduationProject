import { useForm } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function CreateBotForm({ isOpen, onClose, onSuccess, organizationId }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        token: '',
        bot_url: '',
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
                                    Создать бота
                                </Dialog.Title>

                                <form onSubmit={submit}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main">Название бота *</label>
                                        <input
                                            type="text"
                                            autoFocus
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Мой учебный бот"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main">Юзернейм бота *</label>
                                        <input
                                            type="text"
                                            value={data.bot_url}
                                            onChange={(e) => setData('bot_url', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="@МойБот"
                                        />
                                        {errors.bot_url && <p className="mt-1 text-sm text-red-500">{errors.bot_url}</p>}
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
                                            className="btn-primary"
                                        >
                                            {processing ? 'Создание...' : 'Создать'}
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
