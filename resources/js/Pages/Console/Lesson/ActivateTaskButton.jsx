import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function ActivateTaskButton({ task, organization }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleActivate = () => {
        setIsProcessing(true);
        router.patch(
            route('lessonTask.setActive', {organization: organization, lessonTask: task.id }),
            {
                is_active: true,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsConfirmOpen(false);
                    setIsProcessing(false);
                    router.reload({ only: ['lesson'], preserveScroll: true });
                },
                onError: () => {
                    setIsProcessing(false);
                    setIsConfirmOpen(false);
                },
            }
        );
    };

    return (
        <>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                }}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
                style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                }}
            >
                Сделать активным
            </button>

            {/* Модальное окно подтверждения */}
            <Transition appear show={isConfirmOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => !isProcessing && setIsConfirmOpen(false)}>
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
                                        Активация задания
                                    </Dialog.Title>
                                    <p className="text-sm text-meta mb-6">
                                        Вы действительно хотите сделать задание «{task.title}» активным?
                                        Текущее активное задание (если есть) станет неактивным.
                                    </p>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsConfirmOpen(false)}
                                            disabled={isProcessing}
                                            className="btn-ghost"
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleActivate}
                                            disabled={isProcessing}
                                            style={{ background: 'var(--color-primary)' }}
                                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm text-white"
                                        >
                                            {isProcessing ? 'Активация...' : 'Активировать'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
