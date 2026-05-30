import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import EditHomeworkForm from './EditHomeworkForm';
import SortableQuestions from '@/Pages/Console/Question/SortableQuestions';

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

    const parentLesson = lessons?.data?.find(l => l.id === homework.lesson_id);

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm text-meta">
                    <Link
                        href={route('homework.index', { organization: organization.id })}
                        className="hover:text-main transition-colors"
                    >
                        ← Домашние задания
                    </Link>
                    <span>/</span>
                    <span className="text-main font-medium truncate">{homework.title}</span>
                </nav>

                {/* Карточка домашнего задания */}
                <div className="glass-card p-6 md:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-main truncate flex items-center gap-2">
                                {homework.title}
                                {homework.is_active !== undefined && (
                                    <span
                                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{
                                            background: homework.is_active
                                                ? 'var(--color-success)'
                                                : 'var(--color-text-muted)',
                                        }}
                                        title={homework.is_active ? 'Активно' : 'Неактивно'}
                                    />
                                )}
                            </h1>
                            {homework.description && (
                                <p className="text-meta mt-2 line-clamp-6 whitespace-pre-wrap">
                                    {homework.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3 self-start">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="btn-primary gap-2"
                            >
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
                        <MetaBadge label="Макс. балл" value={homework.max_score ?? 0} />
                        <MetaBadge label="Вопросов" value={homework.questions?.length ?? 0} />
                        {homework.is_active !== undefined && (
                            <MetaBadge
                                label="Статус"
                                value={
                                    <span className="inline-flex items-center gap-1">
                                        <span
                                            className="inline-block w-2 h-2 rounded-full"
                                            style={{
                                                background: homework.is_active
                                                    ? 'var(--color-success)'
                                                    : 'var(--color-text-muted)',
                                            }}
                                        />
                                        {homework.is_active ? 'Активно' : 'Неактивно'}
                                    </span>
                                }
                            />
                        )}
                        {parentLesson && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm text-meta">Урок:</span>
                                <Link
                                    href={route('lesson.show', {
                                        organization: organization.id,
                                        lesson: parentLesson.id,
                                    })}
                                    className="badge hover:underline"
                                >
                                    {parentLesson.title}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Вопросы */}
                <div className="glass-card p-6 md:p-8">
                    <SortableQuestions
                        questions={homework.questions || []}
                        organizationId={organization.id}
                        parentType="homework"
                        parentId={homework.id}
                    />
                </div>
            </div>

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
                message={`Вы действительно хотите удалить домашнее задание «${homework.title}»? Все вопросы внутри также будут удалены. Это действие необратимо.`}
                processing={isDeleting}
            />

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
