import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal.jsx";
import EditTaskForm from "@/Pages/Console/LessonTask/EditTaskForm.jsx";
import SortableQuestions from "@/Pages/Console/Question/SortableQuestions.jsx";

export default function Show({ auth, organization, task, lessons }) {
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleTaskEdited = () => {
        setIsEditTaskModalOpen(false);
        router.reload({ only: ['task'], preserveScroll: true });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            route('task.destroy', {
                organization: organization.id,
                task: task.id,
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

    const parentLesson = lessons?.data?.find(l => l.id === task.lesson_id);

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm text-meta">
                    <Link
                        href={route('task.index', organization.id)}
                        className="hover:text-main transition-colors"
                    >
                        ← Задания
                    </Link>
                    <span>/</span>
                    <span className="text-main font-medium truncate">{task.title}</span>
                </nav>

                {/* Карточка задания */}
                <div className="glass-card p-6 md:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-main truncate">
                                {task.title}
                            </h1>
                            {task.description && (
                                <p className="text-meta mt-2 line-clamp-6 whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3 self-start">
                            <button
                                onClick={() => setIsEditTaskModalOpen(true)}
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

                    {/* Мета-информация (без SVG) */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Порядок:</span>
                            <span className="font-semibold text-main">{task.order}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Баллы:</span>
                            <span className="font-semibold text-main">{task.max_score ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Статус:</span>
                            <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                    task.is_active ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                            />
                            <span className={`text-sm ${task.is_active ? 'text-success' : 'text-meta'}`}>
                                {task.is_active ? 'Активно' : 'Неактивно'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Вопросов:</span>
                            <span className="font-semibold text-main">{task.questions?.length ?? 0}</span>
                        </div>
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

                {/* Вопросы задания */}
                <div className="glass-card p-6 md:p-8">
                    <SortableQuestions
                        questions={task.questions ?? []}
                        organizationId={organization.id}
                        parentType='task'
                        parentId={task.id}
                    />
                </div>
            </div>

            {/* Модальные окна */}
            <EditTaskForm
                isOpen={isEditTaskModalOpen}
                onClose={() => setIsEditTaskModalOpen(false)}
                task={task}
                lessons={lessons.data}
                organization={organization}
                onSuccess={handleTaskEdited}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Удаление задания"
                message={`Вы действительно хотите удалить задание «${task.title}»? Все вопросы внутри будут удалены. Это действие необратимо.`}
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
