// resources/js/Pages/Organization/CreateOrganizationForm.jsx
import {useForm, usePage} from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function CreateOrganizationForm({ isOpen, onClose, onSuccess }) {
    const { auth } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: auth.user.email,
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
                                    Новая организация
                                </Dialog.Title>

                                <form onSubmit={submit}>
                                    {/* Название */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main">Название *</label>
                                        <input
                                            type="text"
                                            autoFocus
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="ООО «Ромашка»"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-main">Контактный email *</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="info@company.ru"
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
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
                                            className="btn-primary"
                                        >
                                            {processing ? 'Создание...' : 'Создать'}
                                        </button>
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
                                                <h4 className="text-sm font-semibold text-main">Подтверждение почты</h4>
                                                <p className="mt-1 text-sm text-meta">
                                                    Если email организации отличается от вашего, на него будет отправлено письмо со ссылкой для подтверждения. До подтверждения организация будет неактивна.
                                                </p>
                                            </div>
                                        </div>
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
