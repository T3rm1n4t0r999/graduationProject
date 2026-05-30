import { useForm } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function EditGroupForm({ isOpen, onClose, onSuccess, group, organization }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: group?.name || '',
        description: group?.description || '',
        specialty: group?.specialty || '',
        code: group?.code || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('group.update', { organization: organization.id, group: group.id }), {
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
                                            background: 'var(--color-accent-emerald-light)',
                                            color: 'var(--color-accent-emerald)',
                                        }}
                                    >
                                        <span role="img" aria-label="редактирование" className="text-xl">✎</span>
                                    </div>
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-main">
                                        Редактирование группы
                                    </Dialog.Title>
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    {/* Название */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Название *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="form-input-glass w-full"
                                            placeholder="Название группы"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                    </div>

                                    {/* Описание */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Описание
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className="form-input-glass w-full min-h-[80px]"
                                            placeholder="Краткое описание группы"
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                    </div>

                                    {/* Специальность */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Специальность
                                        </label>
                                        <input
                                            type="text"
                                            value={data.specialty}
                                            onChange={(e) => setData('specialty', e.target.value)}
                                            className="form-input-glass w-full"
                                            placeholder="Например: Информатика"
                                        />
                                        {errors.specialty && <p className="mt-1 text-sm text-red-500">{errors.specialty}</p>}
                                    </div>

                                    {/* Код группы */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Код группы
                                        </label>
                                        <input
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            className="form-input-glass w-full"
                                            placeholder="Оставьте пустым для сохранения текущего"
                                            maxLength={5}
                                        />
                                        {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
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
        </Transition>
    );
}
