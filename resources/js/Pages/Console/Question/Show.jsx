import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal.jsx";
import EditQuestionForm from "@/Pages/Console/Question/EditQuestionForm.jsx";

export default function Show({ auth, organization, question, parents }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
        };
        return labels[type] || type;
    };

    const getParentTitle = () => {
        if (!question.questionable) return 'Не привязан';
        return question.questionable.title || `ID: ${question.questionable.id}`;
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-4xl mx-auto px-4 sm:px-0">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                    <Link
                        href={route('question.index', { organization: organization.id })}
                        className="hover:underline hover:text-primary transition-colors"
                    >
                        Вопросы
                    </Link>
                    <span>/</span>
                    <span className="truncate max-w-xs" style={{ color: 'var(--color-text-primary)' }}>
                        {question.question?.substring(0, 60)}
                        {question.question?.length > 60 ? '...' : ''}
                    </span>
                </nav>

                {/* Карточка вопроса */}
                <div className="glass-card p-6 sm:p-8 mb-8 animate-fade-in">
                    {/* Заголовок и кнопки */}
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {question.question}
                        </h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="btn-primary group"
                            >
                                <svg className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Редактировать
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="btn-ghost group"
                                style={{ color: 'var(--color-error)' }}
                            >
                                <svg className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Удалить
                            </button>
                        </div>
                    </div>

                    {/* Метаданные */}
                    <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b" style={{ borderColor: 'var(--color-border)'}}>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary" style={{ color: 'var(--color-text-primary)' }}>
                            {getTypeLabel(question.question_type)}
                        </span>
                        <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Баллы: <strong style={{ color: 'var(--color-primary)' }}>{question.points}</strong>
                        </span>
                        <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Порядок: {question.order}
                        </span>
                        <span className={`flex items-center gap-1 text-sm font-medium ${question.is_active ? 'text-success' : 'text-meta'}`}>
                            {question.is_active ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                                    Активен
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-meta"></span>
                                    Неактивен
                                </>
                            )}
                        </span>
                    </div>

                    {/* Привязка к заданию */}
                    <div className="flex items-center gap-2 p-3 rounded-xl mb-6" style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Привязан к: <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{getParentTitle()}</span>
                        </span>
                    </div>

                    {/* Варианты ответов */}
                    {question.options && question.options.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Варианты ответов
                            </h3>
                            <div className="space-y-2">
                                {question.options.map((option, index) => {
                                    const isCorrect = question.correct_answers?.includes(String(index));
                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${
                                                isCorrect
                                                    ? 'border-success/30 bg-success/5'
                                                    : 'border-[var(--color-border)] bg-[var(--color-bg-card)]'
                                            }`}
                                        >
                                            {/* Кастомный чекбокс/радио (только для отображения) */}
                                            <div className="relative flex items-center justify-center">
                                                <div
                                                    className={`w-5 h-5 flex items-center justify-center border-2 transition-all ${
                                                        question.question_type === 'single_choice' ? 'rounded-full' : 'rounded-md'
                                                    } ${
                                                        isCorrect
                                                            ? 'bg-success-light border-success'
                                                            : 'border-[var(--color-border)] bg-[var(--color-bg-card)]'
                                                    }`}
                                                    style={isCorrect ? {
                                                        backgroundColor: 'var(--color-success)',
                                                        borderColor: 'var(--color-success)',
                                                        opacity: 0.15,
                                                    } : {}}
                                                >
                                                    {isCorrect && (
                                                        <div className="flex items-center justify-center w-full h-full">
                                                            {question.question_type === 'single_choice' ? (
                                                                <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor" style={{ color: 'var(--color-success)' }}>
                                                                    <circle cx="6" cy="6" r="3" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-success)' }}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <span className="flex-1 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                {option.text}
                                            </span>

                                            {isCorrect && (
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                                                      style={{
                                                          backgroundColor: 'var(--color-success)',
                                                          color: '#fff',
                                                          opacity: 0.9,
                                                      }}>
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
                        <div className="p-4 rounded-xl mt-6" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Пояснение
                            </h3>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                {question.explanation}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальные окна */}
            <EditQuestionForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                question={question}
                tasks={parents.data || []}
                organization={organization}
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
        </ConsoleLayout>
    );
}
