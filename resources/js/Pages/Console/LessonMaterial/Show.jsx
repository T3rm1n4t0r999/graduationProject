import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal.jsx";
import EditMaterialForm from "@/Pages/Console/LessonMaterial/EditMaterialForm.jsx";

function VideoEmbed({ url }) {
    // Проверка на YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        return (
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md">
                <div className="relative pt-[56.25%]">
                    <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        );
    }

    // Прямая ссылка на видеофайл (mp4, webm, ogg)
    if (/\.(mp4|webm|ogg)$/i.test(url)) {
        return (
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md">
                <video controls className="w-full h-72 md:h-96 object-contain bg-black">
                    <source src={url} />
                    Ваш браузер не поддерживает видео.
                </video>
            </div>
        );
    }

    // Обычная ссылка
    return (
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm font-medium text-meta mb-1 uppercase">Видео по ссылке</p>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline break-all hover:no-underline"
            >
                {url}
            </a>
        </div>
    );
}

export default function Show({ auth, organization, material, lessons }) {
    const [isEditMaterialModalOpen, setIsEditMaterialModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null);

    const handleMaterialEdited = () => {
        setIsEditMaterialModalOpen(false);
        router.reload({ only: ['material'], preserveScroll: true });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            route('material.destroy', {
                organization: organization.id,
                material: material.id,
            }),
            {
                preserveState: false,
                preserveScroll: false,
                onError: () => {
                    setIsDeleting(false);
                    setIsDeleteModalOpen(false);
                },
            }
        );
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm text-meta">
                    <Link
                        href={route('material.index', organization.id)}
                        className="hover:text-main transition-colors"
                    >
                        ← Материалы
                    </Link>
                    <span>/</span>
                    <span className="text-main font-medium truncate">{material.title}</span>
                </nav>

                {/* Карточка материала */}
                <div className="glass-card p-6 md:p-8 space-y-8">
                    {/* Изображение материала (если есть) */}
                    {/* Медиа: изображение, видеофайл или ссылка на видео */}
                    {(material.image || material.video || material.video_url) && (
                        <div className="space-y-4">
                            {/* Изображение */}
                            {material.image && (
                                <div
                                    className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                                    onClick={() => setLightboxImage(material.image)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && setLightboxImage(material.image)}
                                    aria-label="Открыть изображение в полном размере"
                                >
                                    <img
                                        src={material.image.url}
                                        alt={material.image.name || 'Изображение материала'}
                                        className="w-full h-72 md:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <span className="text-white text-sm font-medium">
                        {material.image.name} &middot; {material.image.human_size}
                    </span>
                                    </div>
                                </div>
                            )}

                            {/* Видеофайл */}
                            {material.video && !material.image && (
                                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md">
                                    <video
                                        controls
                                        className="w-full h-72 md:h-96 object-contain bg-black"
                                        src={material.video.url}
                                        poster={material.image?.url} // если есть изображение, можно использовать как постер, но тут мы показываем отдельно
                                    >
                                        Ваш браузер не поддерживает видео.
                                    </video>
                                    <p className="text-sm text-meta p-3">
                                        {material.video.name} &middot; {material.video.human_size}
                                    </p>
                                </div>
                            )}

                            {material.video_url && <VideoEmbed url={material.video_url} />}
                        </div>
                    )}

                    {/* Заголовок и кнопки */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-main truncate">
                            {material.title}
                        </h1>
                        <div className="flex items-center gap-3 self-start">
                            <button
                                onClick={() => setIsEditMaterialModalOpen(true)}
                                className="btn-primary gap-2"
                            >
                                &#9998; Редактировать
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="btn-ghost gap-2"
                                style={{ color: 'var(--color-accent-rose)' }}
                            >
                                &#10005; Удалить
                            </button>
                        </div>
                    </div>

                    {/* Основной контент материала */}
                    {material.content && (
                        <div>
                            <div className="text-sm font-medium text-meta mb-3 uppercase tracking-wider">
                                Содержание
                            </div>
                            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="text-meta leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                                    {material.content}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Мета-информация */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <MetaBadge label="Порядок" value={material.order} />

                        {material.lesson_id && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm text-meta">Урок:</span>
                                <Link
                                    href={route('lesson.show', {
                                        organization: organization.id,
                                        lesson: material.lesson_id,
                                    })}
                                    className="badge hover:underline"
                                >
                                    {lessons.find(l => l.id === material.lesson_id)?.title || `Урок #${material.lesson_id}`}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Модальные окна */}
            <EditMaterialForm
                key={material?.id}
                isOpen={isEditMaterialModalOpen}
                onClose={() => setIsEditMaterialModalOpen(false)}
                material={material}
                lessons={lessons.data}
                organization={organization}
                onSuccess={handleMaterialEdited}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Удаление материала"
                message={`Вы действительно хотите удалить материал «${material.title}»? Все связанные данные будут потеряны. Это действие необратимо.`}
                processing={isDeleting}
            />

            {/* Лайтбокс для просмотра изображения */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-5xl max-h-full">
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-3 right-3 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
                            aria-label="Закрыть"
                        >
                            &#10005;
                        </button>
                        <img
                            src={lightboxImage.url}
                            alt={lightboxImage.name}
                            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border-2 border-white/10"
                        />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </ConsoleLayout>
    );
}

function MetaBadge({ label, value }) {
    return (
        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
            <span>{label}:</span>
            <span className="font-semibold text-main">{value}</span>
        </div>
    );
}

function TelegramMaterialPreview({ material }) {
    // Разбиваем контент на строки по 30 символов
    const wrapText = (text, charsPerLine = 30) => {
        if (!text) return '';
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + ' ' + word).trim().length > charsPerLine) {
                lines.push(currentLine.trim());
                currentLine = word;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
            }
        });
        if (currentLine) lines.push(currentLine.trim());

        return lines.join('\n');
    };

    const wrappedContent = wrapText(material.content, 30);

    return (
        <div className="glass-card p-5 md:p-7">
            <h2 className="text-lg font-semibold text-main mb-5 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-sm font-bold"
                      style={{
                          background: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                      }}
                >
                    T
                </span>
                Предпросмотр в Telegram
            </h2>

            <div
                className="rounded-2xl p-4 shadow-inner relative overflow-hidden"
                style={{
                    background: 'var(--tg-bg)',
                    border: '1px solid var(--color-border)',
                }}
            >
                {/* Паттерн точек как в Telegram */}
                <div
                    className="absolute inset-0 opacity-10 dark:opacity-5"
                    style={{
                        backgroundImage: 'radial-gradient(circle, var(--tg-pattern-dot) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />

                <div className="flex justify-start relative z-10">
                    <div
                        className="relative rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm"
                        style={{
                            background: 'var(--tg-bubble)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        {/* Изображение уменьшено до 64px */}
                        {material.image && (
                            <div className="mb-3">
                                <img
                                    src={material.image.url}
                                    alt={material.image.name || 'Изображение'}
                                    className="w-120 h-64 object-cover rounded-lg"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        {/* Название */}
                        <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                            {material.title}
                        </p>

                        {/* Содержание (с переносом каждые 30 символов) */}
                        {material.content && (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed break-words" style={{ color: 'var(--color-text-secondary)' }}>
                                {wrappedContent}
                            </p>
                        )}

                        {/* Заглушка если нет контента */}
                        {!material.content && (
                            <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                                Содержание отсутствует
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-xs text-meta mt-3 leading-relaxed">
                Предпросмотр отображения материала в Telegram-боте. Контент автоматически переносится по 30 символов в строке.
            </p>
        </div>
    );
}
