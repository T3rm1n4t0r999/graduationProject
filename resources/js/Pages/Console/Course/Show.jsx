import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal.jsx";
import EditCourseForm from "@/Pages/Console/Course/EditCourseForm.jsx";
import SortableModules from "@/Pages/Console/Module/SortableModules.jsx";

export default function Show({ auth, organization, course }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCourseEdited = () => {
        setIsEditModalOpen(false);
        router.reload({ only: ['course'], preserveScroll: true });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            route('course.destroy', {
                organization: organization.id,
                course: course.id,
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

    // Массив модулей из связи курса
    const courseModules = course?.modules || [];

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm text-meta">
                    <Link
                        href={route('course.index', organization.id)}
                        className="hover:text-main transition-colors"
                    >
                        ← Курсы
                    </Link>
                    <span>/</span>
                    <span className="text-main font-medium truncate">{course.title}</span>
                </nav>

                {/* Карточка курса */}
                <div className="glass-card p-6 md:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-main truncate">
                                {course.title}
                            </h1>
                            {course.description && (
                                <p className="text-meta mt-2 line-clamp-6 whitespace-pre-wrap">
                                    {course.description}
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
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t"
                         style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Порядок:</span>
                            <span className="font-semibold text-main">{course.order}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Модулей:</span>
                            <span className="font-semibold text-main">{courseModules.length}</span>
                        </div>

                        <div
                            className={`flex items-center gap-1.5 text-sm rounded-lg px-3 py-1.5 ${
                                course.is_active
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-gray-100 dark:bg-gray-800/50 text-meta'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${course.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            <span>{course.is_active ? 'Активен' : 'Неактивен'}</span>
                        </div>

                        {course.auto_assign && (
                            <div className="flex items-center gap-1 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg px-3 py-1.5">
                                <span>Автоназначение</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Модули курса — только здесь работает DnD */}
                <div className="glass-card p-6 md:p-8">
                    <SortableModules modules={courseModules} />
                </div>

                {/* Модальные окна */}
                <EditCourseForm
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    course={course}
                    organization={organization}
                    onSuccess={handleCourseEdited}
                />

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Удаление курса"
                    message={`Вы действительно хотите удалить курс «${course.title}»? Все модули и уроки внутри будут удалены. Это действие необратимо.`}
                    processing={isDeleting}
                />
            </div>

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
