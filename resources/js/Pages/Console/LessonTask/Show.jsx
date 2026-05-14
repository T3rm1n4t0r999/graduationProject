// resources/js/Pages/Console/Tasks/Show.jsx
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal.jsx";
import EditTaskForm from "@/Pages/Console/LessonTask/EditTaskForm.jsx";
import SortableQuestions from "@/Pages/Console/LessonTask/SortableQuestionItem.jsx";

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
                lessonTask: task.id,
            }),
            {
                preserveState: false,
                preserveScroll: false,
                onSuccess: () => {
                },
                onError: () => {
                    setIsDeleting(false);
                    setIsDeleteModalOpen(false);
                    // можно добавить сообщение об ошибке
                },
            }
        );
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-4xl mx-auto">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                    <Link
                        href={route('task.index', organization.id)}
                        className="hover:underline"
                    >
                        Уроки
                    </Link>
                    <span>/</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{task.title}</span>
                </nav>

                {/* Карточка задания */}
                <div className="glass-card p-8 mb-8">
                    <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {task.title}
                        </h1>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditTaskModalOpen(true)}
                                className="btn-primary"
                            >
                                Редактировать
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="btn-ghost"
                                style={{ color: 'var(--color-error)' }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Удалить задание
                            </button>
                        </div>
                    </div>

                    <div className="prose max-w-none mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                        <p className="whitespace-pre-wrap">
                            {task.description || 'Описание отсутствует'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        <span>Порядковый номер: {task.order}</span>
                    </div>
                </div>

                {/* Вопросы задания */}
                <div className="glass-card p-8">
                    {/*<SortableQuestions*/}
                    {/*    lessons={task.lessons}*/}
                    {/*    organization={organization.id}*/}
                    {/*    task={task.id}*/}
                    {/*/>*/}
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
                message={`Вы действительно хотите удалить задание «${task.title}»? Все вопросы внутри задания также будут удалены. Это действие нельзя отменить.`}
                processing={isDeleting}
            />
        </ConsoleLayout>
    );
}
