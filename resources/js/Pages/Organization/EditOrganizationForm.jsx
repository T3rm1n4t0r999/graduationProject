// resources/js/Pages/Organization/EditOrganizationForm.jsx
import { useForm, usePage } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

export default function EditOrganizationForm({ isOpen, onClose, onSuccess, organization }) {
    const { data, setData, put, delete: destroyMethod, processing, errors, reset } = useForm({
        name: organization?.name || '',
        email: organization?.email || '',
    });
    const { can } = usePage().props;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const submit = (e) => {
        e.preventDefault();
        put(route('organization.update', organization.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
        });
    };

    const handleDeleteConfirm = (e) => {
        e.preventDefault();
        if (deleteConfirmation.trim() !== organization.name) {
            setDeleteError(`Введите "${organization.name}" точно, как указано выше`);
            return;
        }
        destroyMethod(route('organization.destroy', organization.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmation('');
                onSuccess?.();
            },
            onError: (error) => {
                setDeleteError(error.message || 'Не удалось удалить организацию');
            },
        });
    };

    const handleClose = () => {
        if (!processing) onClose();
    };

    return (
        <>
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium text-main mb-4">
                                        Редактирование организации
                                    </Dialog.Title>

                                    <form onSubmit={submit}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-main">Название *</label>
                                            <input
                                                type="text"
                                                autoFocus
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-main">Контактный email</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                        </div>

                                        <div className="flex justify-between items-center flex-wrap gap-3">
                                            {can?.delete && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsDeleteModalOpen(true)}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                                    disabled={processing}
                                                >
                                                    Удалить организацию
                                                </button>
                                            )}
                                            <div className="flex gap-3">
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
                                                    {processing ? 'Изменение...' : 'Изменить'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Модальное окно удаления */}
            <Transition appear show={isDeleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium text-main mb-2">
                                        Удалить организацию?
                                    </Dialog.Title>

                                    <p className="text-sm text-meta mb-4">
                                        Это действие <strong className="text-red-500">необратимо</strong>.
                                        Все данные организации, включая ботов и пользователей, будут удалены.
                                    </p>

                                    <div className="mb-4 p-3 rounded-xl border" style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}>
                                        <p className="text-sm text-main">
                                            Для подтверждения введите название организации:
                                        </p>
                                        <p className="mt-1 font-mono font-semibold text-main">
                                            {organization.name}
                                        </p>
                                    </div>

                                    <form onSubmit={handleDeleteConfirm}>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-main">Введите название</label>
                                            <input
                                                type="text"
                                                value={deleteConfirmation}
                                                onChange={(e) => { setDeleteConfirmation(e.target.value); setDeleteError(''); }}
                                                className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-red-500 focus:ring-red-500"
                                                placeholder="Введите название организации"
                                                autoFocus
                                            />
                                            {deleteError && <p className="mt-1 text-sm text-red-500">{deleteError}</p>}
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsDeleteModalOpen(false)}
                                                className="btn-ghost"
                                                disabled={processing}
                                            >
                                                Отмена
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing || deleteConfirmation.trim() !== organization.name}
                                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? 'Удаление...' : 'Да, удалить навсегда'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
