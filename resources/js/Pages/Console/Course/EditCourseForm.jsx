
import { useForm, usePage } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

export default function EditCourseForm({ isOpen, onClose, onSuccess, course, organization}) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: course?.title || '',
        description: course?.description || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('course.update',
            { organization: organization.id,
            course: course.id,}), {
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
                                        Редактирование курса
                                    </Dialog.Title>

                                    <form onSubmit={submit}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-main">Название</label>
                                            <input
                                                type="text"
                                                autoFocus
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                        </div>

                                        {/* Description */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-main">Описание</label>
                                            <input
                                                type="text"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-main shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                        </div>

                                        <div className="flex justify-between items-center flex-wrap gap-3">
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

        </>
    );
}
