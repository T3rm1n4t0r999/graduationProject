import { useForm } from '@inertiajs/react';
import { Dialog, Listbox, Switch, Transition, RadioGroup } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';

export default function EditMaterialForm({ isOpen, onClose, onSuccess, material, organization, lessons }) {
    // Определяем текущий тип медиа по данным материала
    const getInitialMediaType = () => {
        if (material?.video_url) return 'video_url';
        if (material?.image || material?.video) return 'file';
        return 'file'; // по умолчанию
    };
    console.log(material)

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        title: material?.title || '',
        content: material?.content || '',
        lesson_id: material?.lesson_id || '',
        is_active: material?.is_active ? true : false,
        image: null,                 // новый файл (может быть image/video)
        video_url: material?.video_url || '',
        // Поля для отображения текущих файлов
        existing_image_url: material?.image?.url || null,
        existing_video_url: material?.video?.url || null,
        existing_file_name: material?.image?.name || material?.video?.name || null,
    });

    const [mediaType, setMediaType] = useState(getInitialMediaType());

    const submit = (e) => {
        e.preventDefault();
        put(
            route('material.update', {
                organization: organization.id,
                material: material.id,
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

    const selectedLesson = lessons?.find((l) => l.id == data.lesson_id);

    // Есть ли текущий файл (изображение/видео)
    const hasExistingFile = data.existing_image_url || data.existing_video_url;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                {/* Overlay */}
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
                                            background: 'var(--color-accent-sky-light)',
                                            color: 'var(--color-accent-sky)',
                                        }}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </div>
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-main">
                                        Редактирование материала
                                    </Dialog.Title>
                                </div>

                                <form onSubmit={submit} className="space-y-5">
                                    {/* Урок */}
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
                                                        {lessons?.map((lesson) => (
                                                            <Listbox.Option
                                                                key={lesson.id}
                                                                value={lesson.id}
                                                                className={({ active, selected }) =>
                                                                    `relative cursor-pointer select-none py-2.5 px-4 text-sm transition-colors ${
                                                                        active ? 'bg-primary-light' : ''
                                                                    } ${selected ? 'font-medium' : ''}`
                                                                }
                                                                style={{ color: 'var(--color-text-primary)' }}
                                                            >
                                                                {({ selected }) => (
                                                                    <div className="flex items-center justify-between">
                                                                        <span>{lesson.title}</span>
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
                                            placeholder="Название материала"
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    {/* Содержание */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">
                                            Содержание
                                        </label>
                                        <textarea
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                            className="form-input-glass min-h-[120px]"
                                            placeholder="Содержание материала"
                                        />
                                        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                                    </div>

                                    {/* ===== Медиа ===== */}
                                    <div>
                                        <label className="block text-xs font-medium text-meta mb-2 uppercase tracking-wide">
                                            Медиа
                                        </label>

                                        {/* Текущий файл/ссылка */}
                                        {hasExistingFile && mediaType === 'file' && !data.image && (
                                            <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <p className="text-xs text-meta mb-1">Текущий файл:</p>
                                                {data.existing_image_url && (
                                                    <img
                                                        src={data.existing_image_url}
                                                        alt="Текущее"
                                                        className="h-32 w-auto rounded-lg object-cover border"
                                                    />
                                                )}
                                                {data.existing_video_url && (
                                                    <div>
                                                        <video controls className="h-32 w-auto rounded-lg border">
                                                            <source src={data.existing_video_url} />
                                                        </video>
                                                        <p className="text-xs text-meta mt-1">{data.existing_file_name}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {material?.video_url && mediaType === 'video_url' && !data.video_url && (
                                            <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <p className="text-xs text-meta mb-1">Текущая ссылка:</p>
                                                <a href={material.video_url} target="_blank" className="text-blue-600 text-sm break-all">{material.video_url}</a>
                                            </div>
                                        )}

                                        {/* Переключатель */}
                                        <RadioGroup value={mediaType} onChange={setMediaType}>
                                            <div className="flex gap-3">
                                                <RadioGroup.Option
                                                    value="file"
                                                    className={({ checked }) =>
                                                        `cursor-pointer rounded-xl px-4 py-2 text-sm border transition-colors ${
                                                            checked
                                                                ? 'bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-900/30 dark:border-sky-600 dark:text-sky-200'
                                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-main hover:border-sky-200'
                                                        }`
                                                    }
                                                >
                                                    Файл с диска
                                                </RadioGroup.Option>
                                                <RadioGroup.Option
                                                    value="video_url"
                                                    className={({ checked }) =>
                                                        `cursor-pointer rounded-xl px-4 py-2 text-sm border transition-colors ${
                                                            checked
                                                                ? 'bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-900/30 dark:border-sky-600 dark:text-sky-200'
                                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-main hover:border-sky-200'
                                                        }`
                                                    }
                                                >
                                                    Ссылка на видео
                                                </RadioGroup.Option>
                                            </div>
                                        </RadioGroup>

                                        <div className="mt-3">
                                            {mediaType === 'file' && (
                                                <>
                                                    <input
                                                        type="file"
                                                        accept="image/*,video/*"
                                                        onChange={(e) => setData('image', e.target.files[0])}
                                                        className="block w-full text-sm text-main file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary/20"
                                                    />
                                                    {data.image && (
                                                        <div className="mt-2">
                                                            {data.image.type.startsWith('image/') ? (
                                                                <img
                                                                    src={URL.createObjectURL(data.image)}
                                                                    alt="Предпросмотр"
                                                                    className="h-32 w-auto rounded-lg object-cover border"
                                                                />
                                                            ) : (
                                                                <p className="text-sm text-meta">
                                                                    Новый файл: <span className="font-medium text-main">{data.image.name}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
                                                </>
                                            )}

                                            {mediaType === 'video_url' && (
                                                <>
                                                    <input
                                                        type="url"
                                                        value={data.video_url}
                                                        onChange={(e) => setData('video_url', e.target.value)}
                                                        className="form-input-glass"
                                                        placeholder="https://www.youtube.com/watch?v=..."
                                                    />
                                                    {errors.video_url && <p className="mt-1 text-sm text-red-500">{errors.video_url}</p>}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Активность */}
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium text-main">Сделать активным</span>
                                        <Switch
                                            checked={data.is_active}
                                            onChange={(value) => setData('is_active', value)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                                data.is_active ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'
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
