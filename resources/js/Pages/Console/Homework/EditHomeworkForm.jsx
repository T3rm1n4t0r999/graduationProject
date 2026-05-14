
import { useForm, usePage } from '@inertiajs/react';
import {Dialog, Listbox, Switch, Transition} from '@headlessui/react';
import { Fragment, useState } from 'react';

export default function EditHomeworkForm({ isOpen, onClose, onSuccess, homework, organization, lessons }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: homework?.title || '',
        description: homework?.description || '',
        lesson_id: homework.lesson_id || '',
        is_active: homework?.is_active || false,
    });

    const submit = (e) => {
        e.preventDefault();
        put(
            route('homework.update', {
                organization: organization.id,
                homework: homework.id,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            }
        );
    };

    const selectedLesson = lessons?.find((c) => c.id == data.lesson_id);

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
                                        Редактирование домашнего задания
                                    </Dialog.Title>

                                    <form onSubmit={submit}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-main mb-2">
                                                Урок *
                                            </label>
                                            <Listbox value={data.lesson_id} onChange={(value) => setData('lesson_id', value)}>
                                                <div className="relative">
                                                    <Listbox.Button
                                                        className="form-input-glass w-full text-left flex items-center justify-between pr-10"
                                                    >
                                                        <span className={selectedLesson ? 'text-main' : 'text-meta'}>
                                                            {selectedLesson ? selectedLesson.title : 'Выберите урок'}
                                                        </span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                            <svg className="h-5 w-5 text-meta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                            </svg>
                                                        </span>
                                                    </Listbox.Button>
                                                    <Transition
                                                        as={Fragment}
                                                        leave="transition ease-in duration-100"
                                                        leaveFrom="opacity-100"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <Listbox.Options
                                                            className="absolute z-20 mt-2 w-full overflow-auto rounded-xl border shadow-lg focus:outline-none"
                                                            style={{
                                                                background: 'var(--color-bg-card)',
                                                                borderColor: 'var(--color-border)',
                                                                backdropFilter: 'blur(16px)',
                                                                WebkitBackdropFilter: 'blur(16px)',
                                                                maxHeight: '15rem',
                                                            }}
                                                        >
                                                            {lessons?.map((lessonItem) => (
                                                                <Listbox.Option
                                                                    key={lessonItem.id}
                                                                    value={lessonItem.id}
                                                                    className={({ active, selected }) =>
                                                                        `relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors ${
                                                                            active ? 'bg-primary-light' : ''
                                                                        } ${selected ? 'font-medium' : ''}`
                                                                    }
                                                                    style={{
                                                                        color: 'var(--color-text-primary)',
                                                                        background: undefined,
                                                                    }}
                                                                >
                                                                    {({ selected }) => (
                                                                        <div className="flex items-center justify-between">
                                                                            <span className={selected ? 'text-primary font-semibold' : 'text-main'}>
                                                                                {lessonItem.title}
                                                                            </span>
                                                                            {selected && (
                                                                                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                            {errors.lesson_id && <p className="mt-1 text-sm text-red-500">{errors.lesson_id}</p>}
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-main">Название</label>
                                            <input
                                                type="text"
                                                autoFocus
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="form-input-glass mt-1"
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
                                                className="form-input-glass mt-1"
                                            />
                                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                        </div>

                                        {/* Переключатель "Активное задание" */}
                                        <div className="mb-6 flex items-center justify-between">
                                            <span className="text-sm font-medium text-main">Сделать активным</span>
                                            <Switch
                                                checked={data.is_active}
                                                onChange={(value) => setData('is_active', value)}
                                                style={{
                                                    background: data.is_active ? 'var(--color-primary)' : 'var(--color-text-muted)'
                                                }}
                                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                                            >
                                            <span
                                                className={`${
                                                    data.is_active ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                            </Switch>
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
