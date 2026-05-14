
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import EditHomeworkForm from './EditHomeworkForm';

export default function Show({ auth, organization, homework, lessons }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleHomeworkEdited = () => {
        setIsEditModalOpen(false);
        router.reload({ only: ['homework'], preserveScroll: true });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            route('homework.destroy', {
                organization: organization.id,
                homework: homework.id,
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
            <div className="max-w-4xl mx-auto">
                {/* Хлебные крошки */}
                <nav
                    className="flex items-center gap-2 text-sm mb-6"
                    style={{ color: 'var(--color-text-muted)' }}
                >
                    <Link
                        href={route('homework.index', { organization: organization.id })}
                        className="hover:underline"
                    >
                        Домашние задания
                    </Link>
                    <span>/</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                        {homework.title}
                    </span>
                </nav>

                {/* Карточка домашнего задания */}
                <div className="glass-card p-8 mb-8">
                    <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                        <h1
                            className="text-3xl font-bold"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {homework.title}
                        </h1>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="btn-primary"
                            >
                                Редактировать
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="btn-ghost"
                                style={{ color: 'var(--color-error)' }}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                Удалить задание
                            </button>
                        </div>
                    </div>

                    <div
                        className="prose max-w-none mb-6"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <p className="whitespace-pre-wrap">
                            {homework.description || 'Описание отсутствует'}
                        </p>
                    </div>

                    <div
                        className="flex items-center gap-6 text-sm"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        <span>Макс. балл: {homework.max_score || '0'}</span>
                        {homework.lesson && (
                            <span>
                                Урок:{' '}
                                <Link
                                    href={route('lesson.show', {
                                        organization: organization.id,
                                        lesson: homework.lesson.id,
                                    })}
                                    className="hover:underline"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    {homework.lesson.title}
                                </Link>
                            </span>
                        )}
                    </div>
                </div>

                {/* Вопросы домашнего задания */}
                <div className="glass-card p-8">
                    <h2
                        className="text-xl font-semibold mb-4"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Вопросы ({homework?.questions_count || 0})
                    </h2>
                    {homework.questions && homework.questions.length > 0 ? (
                        <div className="space-y-4">
                            {homework.questions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="p-4 rounded-lg border"
                                    style={{
                                        borderColor: 'var(--color-border)',
                                        background: 'var(--color-bg-card)',
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p
                                                className="font-medium"
                                                style={{ color: 'var(--color-text-primary)' }}
                                            >
                                                Вопрос {index + 1}: {question.title}
                                            </p>
                                            {question.description && (
                                                <p
                                                    className="text-sm mt-1"
                                                    style={{ color: 'var(--color-text-secondary)' }}
                                                >
                                                    {question.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p
                            className="text-center py-8"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            Вопросы пока не добавлены
                        </p>
                    )}
                </div>
            </div>

            {/* Модальные окна */}
            <EditHomeworkForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                homework={homework}
                lessons={lessons.data}
                organization={organization}
                onSuccess={handleHomeworkEdited}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Удаление домашнего задания"
                message={`Вы действительно хотите удалить домашнее задание «${homework.title}»? Все вопросы внутри задания также будут удалены. Это действие нельзя отменить.`}
                processing={isDeleting}
            />
        </ConsoleLayout>
    );
}
