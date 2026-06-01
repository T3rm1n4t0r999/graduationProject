import ConsoleLayout from "@/Layouts/ConsoleLayout";
import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";
import EditLessonForm from "@/Pages/Console/Lesson/EditLessonForm";
import SortableTasks from "@/Pages/Console/LessonTask/SortableTasks.jsx";
import SortableMaterials from "@/Pages/Console/LessonMaterial/SortableMaterials.jsx";
import CreateHomeworkForm from "@/Pages/Console/Homework/CreateHomeworkForm.jsx";

export default function Show({ auth, organization, lesson, modules }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreateHomeworkModalOpen, setIsCreateHomeworkModalOpen] = useState(false);

    const handleLessonEdited = () => {
        setIsEditModalOpen(false);
        router.reload({ only: ["lesson"], preserveScroll: true });
    };

    const handleHomeworkCreated = () => {
        setIsCreateHomeworkModalOpen(false);
        router.reload({ only: ['homeworks'], preserveScroll: true });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            route("lesson.destroy", {
                organization: organization.id,
                lesson: lesson.id,
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

    const parentModule = modules?.data?.find(m => m.id === lesson.module_id);

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm text-meta">
                    <Link
                        href={route("lesson.index", organization.id)}
                        className="hover:text-main transition-colors"
                    >
                        ← Уроки
                    </Link>
                    <span>/</span>
                    <span className="text-main font-medium truncate">{lesson.title}</span>
                </nav>

                {/* Карточка урока */}
                <div className="glass-card p-6 md:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-main truncate">
                                {lesson.title}
                            </h1>
                            <p className="text-meta mt-2 line-clamp-6 whitespace-pre-wrap">
                                {lesson.description ? lesson.description : "Нет описания"}
                            </p>
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

                    {/* Мета-информация (без SVG) */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Порядок:</span>
                            <span className="font-semibold text-main">{lesson.order}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Заданий:</span>
                            <span className="font-semibold text-main">{lesson.tasks?.length ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Материалов:</span>
                            <span className="font-semibold text-main">{lesson.materials?.length ?? 0}</span>
                        </div>
                        {parentModule && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm text-meta">Модуль:</span>
                                <Link
                                    href={route("module.show", {
                                        organization: organization.id,
                                        module: parentModule.id,
                                    })}
                                    className="badge hover:underline"
                                >
                                    {parentModule.title}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Задания */}
                <div className="glass-card p-6 md:p-8">
                    <SortableTasks
                        tasks={lesson.tasks ?? []}
                        organization={organization}
                        lesson={lesson}
                    />
                </div>

                {/* Материалы */}
                <div className="glass-card p-6 md:p-8">
                    <SortableMaterials
                        materials={lesson.materials ?? []}
                        organization={organization}
                        lesson={lesson}
                    />
                </div>

                {/* Домашнее задание (ДЗ) */}
                <div className="glass-card p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-main mb-6">Домашнее задание</h2>
                    {lesson.homework ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-gray-100 dark:border-gray-700/60">
                            <div className="min-w-0">
                                <h3 className="text-base font-semibold text-main truncate">{lesson.homework.title}</h3>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-meta">
                                    <span className="bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1">
                                        Баллы: <span className="font-medium text-main">{lesson.homework.max_score ?? 0}</span>
                                    </span>
                                    <span className="bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1">
                                        Вопросов: <span className="font-medium text-main">{lesson.homework.questions?.length ?? 0}</span>
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={route('homework.show', { organization: organization.id, homework: lesson.homework.id })}
                                className="btn-primary gap-2 self-start"
                            >
                                Просмотреть →
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-meta mb-4">Домашнее задание ещё не создано.</p>
                            <button
                                onClick={() => setIsCreateHomeworkModalOpen(true)}
                                className="btn-primary"
                            >
                                + Создать ДЗ
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальные окна */}
            <EditLessonForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                lesson={lesson}
                modules={modules}
                organization={organization}
                onSuccess={handleLessonEdited}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Удаление урока"
                message={`Вы действительно хотите удалить урок «${lesson.title}»? Все задания и материалы внутри будут удалены. Это действие необратимо.`}
                processing={isDeleting}
            />

            <CreateHomeworkForm
                isOpen={isCreateHomeworkModalOpen}
                onClose={() => setIsCreateHomeworkModalOpen(false)}
                organization={organization}
                lesson={lesson}
                onSuccess={handleHomeworkCreated}
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
