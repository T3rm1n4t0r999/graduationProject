import { useForm } from '@inertiajs/react';
import { Dialog, Listbox, Switch, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function EditHomeworkForm({ isOpen, onClose, onSuccess, homework, organization, lessons }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: homework?.title || '',
        description: homework?.description || '',
        lesson_id: homework.lesson_id || '',
        is_active: homework?.is_active ?? false,
        max_attempts: homework?.max_attempts || '',
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
                                        <span className="text-xl">✎</span>
                                    </div>
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-main">
                                        Редактирование ДЗ
                                    </Dialog.Title>
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    {/* Выбор урока */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Урок *
                                        </label>
                                        <Listbox value={data.lesson_id} onChange={(value) => setData('lesson_id', value)}>
                                            <div className="relative">
                                                <Listbox.Button className="form-input-glass w-full text-left flex items-center justify-between pr-10">
                                                    <span className={selectedLesson ? 'text-main' : 'text-meta'}>
                                                        {selectedLesson ? selectedLesson.title : 'Выберите урок'}
                                                    </span>
                                                    <span className="text-meta text-sm">▼</span>
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
                                                                style={{ color: 'var(--color-text-primary)' }}
                                                            >
                                                                {({ selected }) => (
                                                                    <div className="flex items-center justify-between">
                                                                        <span>{lessonItem.title}</span>
                                                                        {selected && (
                                                                            <span style={{ color: 'var(--color-primary)' }}>✓</span>
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
                                            placeholder="Название ДЗ"
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
                                            placeholder="Описание домашнего задания"
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                    </div>

                                    {/* Попытки */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Максимальное количество попыток
                                        </label>
                                        <input
                                            type="number"
                                            value={data.max_attempts}
                                            onChange={(e) => setData('max_attempts', e.target.value)}
                                            className="form-input-glass min-h-[80px]"
                                            placeholder="Оставьте пустым для неограниченного количества"
                                        />
                                        {errors.max_attempts && <p className="mt-1 text-sm text-red-500">{errors.max_attempts}</p>}
                                    </div>

                                    {/* Активность */}
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium text-main">Сделать активным</span>
                                        <Switch
                                            checked={data.is_active}
                                            onChange={(value) => setData('is_active', value)}
                                            style={{
                                                background: data.is_active
                                                    ? 'var(--color-accent-amber)'
                                                    : 'var(--color-text-muted)',
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

                                    {/* Кнопки */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={handleClose} className="btn-ghost" disabled={processing}>
                                            Отмена
                                        </button>
                                        <button type="submit" disabled={processing} className="btn-primary flex items-center gap-2">
                                            {processing ? (
                                                <>
                                                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
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
