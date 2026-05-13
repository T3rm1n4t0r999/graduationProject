import { useForm } from '@inertiajs/react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { Fragment, useState } from 'react';

export default function CreateModuleForm({ isOpen, onClose, onSuccess, organization, courses = null, course = null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        course_id: course?.id || courses?.[0]?.id || '',
    });
    const submit = (e) => {
        e.preventDefault();
        post(
            route('module.store', {
                organization: organization.id
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

    const handleClose = () => {
        if (!processing) onClose();
    };

    // Найти выбранный курс для отображения метки
    const selectedCourse = courses?.find((c) => c.id == data.course_id);

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
                                    Новый модуль
                                </Dialog.Title>

                                <form onSubmit={submit}>
                                    {/* Кастомный селект курса */}
                                    {!course && <div className="mb-4">
                                    <label className="block text-sm font-medium text-main mb-2">
                                        Курс *
                                    </label>
                                    <Listbox value={data.course_id} onChange={(value) => setData('course_id', value)}>
                                        <div className="relative">
                                            <Listbox.Button
                                                className="form-input-glass w-full text-left flex items-center justify-between pr-10"
                                            >
                                                    <span className={selectedCourse ? 'text-main' : 'text-meta'}>
                                                        {selectedCourse ? selectedCourse.title : 'Выберите курс'}
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
                                                <Listbox.Options className="absolute z-20 mt-2 w-full overflow-auto rounded-xl border shadow-lg focus:outline-none"
                                                                 style={{
                                                                     background: 'var(--color-bg-card)',
                                                                     borderColor: 'var(--color-border)',
                                                                     backdropFilter: 'blur(16px)',
                                                                     WebkitBackdropFilter: 'blur(16px)',
                                                                     maxHeight: '15rem',
                                                                 }}
                                                >
                                                    {courses?.map((course) => (
                                                        <Listbox.Option
                                                            key={course.id}
                                                            value={course.id}
                                                            className={({ active, selected }) =>
                                                                `relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors ${
                                                                    active ? 'bg-primary-light' : ''
                                                                } ${selected ? 'font-medium' : ''}`
                                                            }
                                                            style={{
                                                                color: 'var(--color-text-primary)',
                                                                background: undefined, // handled by className active
                                                            }}
                                                        >
                                                            {({ selected }) => (
                                                                <div className="flex items-center justify-between">
                                                                        <span className={selected ? 'text-primary font-semibold' : 'text-main'}>
                                                                            {course.title}
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
                                    {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.course_id}</p>}
                                </div>}

                                    {/* Название */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-main">Название *</label>
                                        <input
                                            type="text"
                                            autoFocus
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="form-input-glass mt-1"
                                            placeholder="Введение"
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    {/* Описание */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-main">Описание</label>
                                        <input
                                            type="text"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="form-input-glass mt-1"
                                            placeholder="Описание модуля"
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                    </div>

                                    {/* Кнопки */}
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={handleClose} className="btn-ghost" disabled={processing}>
                                            Отмена
                                        </button>
                                        <button type="submit" disabled={processing} className="btn-primary">
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
