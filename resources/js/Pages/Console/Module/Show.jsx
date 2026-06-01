import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal.jsx";
import EditModuleForm from '@/Pages/Console/Module/EditModuleForm';
import SortableLessons from "@/Pages/Console/Lesson/SortableLessons.jsx";
import CreateExamForm from '@/Pages/Console/Exam/CreateExamForm';
import CreateLessonForm from "@/Pages/Console/Lesson/CreateLessonForm.jsx";

export default function Show({ auth, organization, module, courses }) {
    const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);

    const handleModuleEdited = () => {
        setIsEditModuleModalOpen(false);
        router.reload({ only: ['module'], preserveScroll: true });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(
            route('module.destroy', {
                organization: organization.id,
                module: module.id,
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

    const handleExamCreated = () => {
        setIsCreateExamModalOpen(false);
        router.reload({ only: ['module'], preserveScroll: true });
    };

    const handleLessonCreated = () => {
        setIsCreateLessonModalOpen(false);
        router.reload({ only: ['module'], preserveScroll: true });
    };

    // ✅ Исправлено: courses — это массив, не пагинатор
    const parentCourse = courses?.find(c => c.id === module.course_id);
    const moduleLessons = module?.lessons || [];

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm text-meta">
                    <Link
                        href={route('module.index', organization.id)}
                        className="hover:text-main transition-colors"
                    >
                        ← Модули
                    </Link>
                    <span>/</span>
                    <span className="text-main font-medium truncate">{module.title}</span>
                </nav>

                {/* Карточка модуля */}
                <div className="glass-card p-6 md:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-main truncate">
                                {module.title}
                            </h1>
                            {module.description && (
                                <p className="text-meta mt-2 line-clamp-6 whitespace-pre-wrap">
                                    {module.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3 self-start">
                            <button
                                onClick={() => setIsEditModuleModalOpen(true)}
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
                            <span className="font-semibold text-main">{module.order}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-meta bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1.5">
                            <span>Уроков:</span>
                            <span className="font-semibold text-main">{moduleLessons.length}</span>
                        </div>
                        {parentCourse && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm text-meta">Курс:</span>
                                <Link
                                    href={route('course.show', {
                                        organization: organization.id,
                                        course: parentCourse.id,
                                    })}
                                    className="badge hover:underline"
                                >
                                    {parentCourse.title}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Уроки — только здесь работает DnD */}
                <div className="glass-card p-6 md:p-8">
                    {moduleLessons.length > 0 ? (
                        <SortableLessons
                            lessons={moduleLessons}
                            module={module}
                            organization={organization}
                        />
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-meta mb-4">В этом модуле пока нет уроков.</p>
                            <button
                                onClick={() => setIsCreateLessonModalOpen(true)}
                                className="btn-primary"
                            >
                                + Создать урок
                            </button>
                        </div>
                    )}
                </div>

                {/* Контрольная работа */}
                <div className="glass-card p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-main mb-6">Контрольная работа</h2>
                    {module.exam ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border border-gray-100 dark:border-gray-700/60">
                            <div className="min-w-0">
                                <h3 className="text-base font-semibold text-main truncate">{module.exam.title}</h3>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-meta">
                                    <span className="bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1">
                                        Баллы: <span className="font-medium text-main">{module.exam.max_score ?? 0}</span>
                                    </span>
                                    <span className="bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1">
                                        Вопросов: <span className="font-medium text-main">{module.exam.questions?.length ?? 0}</span>
                                    </span>
                                    {module.exam.time_limit && (
                                        <span className="bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-1">
                                            Время: <span className="font-medium text-main">{module.exam.time_limit} мин</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Link
                                href={route('exam.show', {
                                    organization: organization.id,
                                    exam: module.exam.id,
                                })}
                                className="btn-primary gap-2 self-start"
                            >
                                Просмотреть →
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-meta mb-4">Контрольная работа ещё не создана.</p>
                            <button
                                onClick={() => setIsCreateExamModalOpen(true)}
                                className="btn-primary"
                            >
                                + Создать КР
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальные окна */}
            <EditModuleForm
                isOpen={isEditModuleModalOpen}
                onClose={() => setIsEditModuleModalOpen(false)}
                module={module}
                courses={courses}
                organization={organization}
                onSuccess={handleModuleEdited}
            />
            <CreateLessonForm
                isOpen={isCreateLessonModalOpen}
                onClose={() => setIsCreateLessonModalOpen(false)}
                module={module}
                organization={organization}
                onSuccess={handleLessonCreated}
            />
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Удаление модуля"
                message={`Вы действительно хотите удалить модуль «${module.title}»? Все уроки и материалы внутри будут удалены. Это действие необратимо.`}
                processing={isDeleting}
            />
            <CreateExamForm
                isOpen={isCreateExamModalOpen}
                onClose={() => setIsCreateExamModalOpen(false)}
                organization={organization}
                module={module}
                onSuccess={handleExamCreated}
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
