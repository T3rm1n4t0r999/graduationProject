import { useForm } from '@inertiajs/react';
import { Dialog, Listbox, Switch, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function EditModuleForm({ isOpen, onClose, onSuccess, module, organization, courses }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: module?.title || '',
        description: module?.description || '',
        course_id: module?.course_id || '',
        is_active: module?.is_active ? true : false,
    });

    const submit = (e) => {
        e.preventDefault();
        put(
            route('module.update', {
                organization: organization.id,
                module: module.id,
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
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all animate-fade-in">
                                <div className="flex items-center gap-3 mb-6">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: 'var(--color-accent-amber-light)',
                                            color: 'var(--color-accent-amber)',
                                        }}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-main">
                                        Редактирование модуля
                                    </Dialog.Title>
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    {/* Выбор курса */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Курс *
                                        </label>
                                        <Listbox value={data.course_id} onChange={(value) => setData('course_id', value)}>
                                            <div className="relative">
                                                <Listbox.Button className="form-input-glass w-full text-left flex items-center justify-between pr-10">
                                                    <span className={selectedCourse ? 'text-main' : 'text-meta'}>
                                                        {selectedCourse ? selectedCourse.title : 'Выберите курс'}
                                                    </span>
                                                    <svg className="absolute right-3 h-5 w-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                    </svg>
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
                                                        {courses?.map((courseItem) => (
                                                            <Listbox.Option
                                                                key={courseItem.id}
                                                                value={courseItem.id}
                                                                className={({ active, selected }) =>
                                                                    `relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors ${
                                                                        active ? 'bg-primary-light' : ''
                                                                    } ${selected ? 'font-medium' : ''}`
                                                                }
                                                                style={{ color: 'var(--color-text-primary)' }}
                                                            >
                                                                {({ selected }) => (
                                                                    <div className="flex items-center justify-between">
                                                                        <span>{courseItem.title}</span>
                                                                        {selected && (
                                                                            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    </div>

                                    {/* Название */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Название *
                                        </label>
                                        <input
                                            type="text"
                                            autoFocus
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="form-input-glass"
                                            placeholder="Название модуля"
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    {/* Описание */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Описание
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="form-input-glass min-h-[80px]"
                                            placeholder="Описание модуля"
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                    </div>

                                    {/* Активность */}
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium text-main">Сделать активным</span>
                                        <Switch
                                            checked={data.is_active}
                                            onChange={(value) => setData('is_active', value)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                                data.is_active ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                        >
                                            <span
                                                className={`${
                                                    data.is_active ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </Switch>
                                    </div>

                                    {/* Кнопки */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={handleClose} className="btn-ghost" disabled={processing}>
                                            Отмена
                                        </button>
                                        <button type="submit" disabled={processing} className="btn-primary flex items-center gap-2">
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Сохранение...
                                                </>
                                            ) : (
                                                'Сохранить'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </Transition>
    );
}
