import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal.jsx";
import EditQuestionForm from "@/Pages/Console/Question/EditQuestionForm.jsx";
import TelegramPreview from "@/Pages/Console/Question/Telegram preview.jsx";

export default function Show({ auth, organization, question, parents = [] }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [lightboxImage, setLightboxImage] = useState(null); // <-- для картинки

    const handleQuestionEdited = () => {
        setIsEditModalOpen(false);
        router.reload({ only: ['question'], preserveScroll: true });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            route('question.destroy', {
                organization: organization.id,
                question: question.id,
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

    const getTypeLabel = (type) => {
        const labels = {
            single_choice: 'Один вариант',
            multiple_choice: 'Несколько вариантов',
            text: 'Текстовый ответ',
            free_text: 'Свободный ответ',
        };
        return labels[type] || type;
    };

    const questionableType = question.questionable_type;
    const typeMap = {
        'lesson_task': 'task',
        'homework': 'homework',
        'exam': 'exam',
    };
    const parentType = typeMap[questionableType] || null;

    const parentLabels = { task: 'Задание', homework: 'ДЗ', exam: 'КР' };
    const parentLabel = parentType ? parentLabels[parentType] : '';

    const parentRoutes = { task: 'task.show', homework: 'homework.show', exam: 'exam.show' };
    const parentRoute = parentType ? parentRoutes[parentType] : null;

    const parentId = question.questionable?.id || question.questionable_id;
    const parentTitle = question.questionable?.title || `ID: ${parentId}`;
    const context = parentType || 'task';

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm text-meta">
                    <Link
                        href={route(`question.${context}.index`, { organization: organization.id })}
                        className="hover:text-main transition-colors"
                    >
                        ← Вопросы
                    </Link>
                    <span>/</span>
                    <span className="text-main font-medium truncate max-w-xs">
                        {question.question?.substring(0, 60)}
                        {question.question?.length > 60 ? '...' : ''}
                    </span>
                </nav>

                {/* Карточка вопроса */}
                <div className="glass-card p-6 md:p-8 space-y-8">
                    {/* Изображение вопроса (если есть) */}
                    {question.image && (
                        <div
                            className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                            onClick={() => setLightboxImage(question.image)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setLightboxImage(question.image)}
                            aria-label="Открыть изображение в полном размере"
                        >
                            <img
                                src={question.image.url}
                                alt={question.image.name || 'Изображение вопроса'}
                                className="w-full h-64 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-white text-sm font-medium">
                                    {question.image.name} · {question.image.human_size}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Заголовок и кнопки */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-main truncate">
                            {question.question}
                        </h1>
                        <div className="flex items-center gap-3 self-start">
                            <button onClick={() => setIsEditModalOpen(true)} className="btn-primary gap-2">
                                ✎ Редактировать
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="btn-ghost gap-2"
                                style={{ color: 'var(--color-accent-rose)' }}
                            >
                                ✕ Удалить
                            </button>
                        </div>
                    </div>

                    {/* Мета-информация */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <MetaBadge label="Порядок" value={question.order} />
                        <MetaBadge label="Баллы" value={question.points ?? 0} />
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span className={`inline-block w-2 h-2 rounded-full ${question.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className={question.is_active ? 'text-success' : 'text-meta'}>
                                {question.is_active ? 'Активно' : 'Неактивно'}
                            </span>
                        </div>
                        <MetaBadge label="Тип" value={getTypeLabel(question.question_type)} />
                        {parentId && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm text-meta">{parentLabel}:</span>
                                {parentRoute ? (
                                    <Link
                                        href={route(parentRoute, {
                                            organization: organization.id,
                                            [parentType === 'lesson_task' ? 'task' : parentType]: parentId,
                                        })}
                                        className="badge hover:underline"
                                    >
                                        {parentTitle}
                                    </Link>
                                ) : (
                                    <span className="text-sm text-main">{parentTitle}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Варианты ответов */}
                    {question.options && question.options.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-main mb-4 uppercase tracking-wider">
                                Варианты ответов
                            </h3>
                            <div className="space-y-3">
                                {question.options.map((option, index) => {
                                    const isCorrect = question.correct_answers?.includes(String(index));
                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                                isCorrect
                                                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                                                    : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            <div
                                                className={`relative flex-shrink-0 w-6 h-6 flex items-center justify-center border-2 ${
                                                    question.question_type === 'single_choice' ? 'rounded-full' : 'rounded-md'
                                                } ${
                                                    isCorrect
                                                        ? 'border-emerald-500 bg-emerald-500'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            >
                                                {isCorrect && (
                                                    question.question_type === 'single_choice' ? (
                                                        <div className="w-3 h-3 bg-white rounded-full" />
                                                    ) : (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )
                                                )}
                                            </div>
                                            <span className="flex-1 text-sm text-main">{option.text}</span>
                                            {isCorrect && (
                                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500 text-white">
                                                    Правильный
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Пояснение */}
                    {question.explanation && (
                        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="text-sm font-semibold text-main mb-3 uppercase tracking-wider">
                                Пояснение
                            </h3>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-meta">
                                {question.explanation}
                            </p>
                        </div>
                    )}

                    <TelegramPreview question={question} />
                </div>
            </div>

            {/* Модальные окна */}
            <EditQuestionForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                question={question}
                parents={parents.data || parents || []}
                organization={organization}
                context={context}
                onSuccess={handleQuestionEdited}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Удаление вопроса"
                message="Вы действительно хотите удалить этот вопрос? Это действие нельзя отменить."
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
                            ✕
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
