import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import EditExamForm from "@/Pages/Console/Exam/EditExamForm.jsx";
import SortableQuestions from '@/Pages/Console/Question/SortableQuestions';

export default function Show({ auth, organization, exam, modules }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleExamEdited = () => {
        setIsEditModalOpen(false);
        router.reload({ only: ['exam'], preserveScroll: true });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('exam.destroy', { organization: organization.id, exam: exam.id }), {
            preserveState: false,
            preserveScroll: false,
            onError: () => {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
            },
        });
    };

    const parentModule = modules?.data?.find(m => m.id === exam.module_id);

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Хлебные крошки */}
                <nav className="flex items-center gap-2 text-sm text-meta">
                    <Link href={route('exam.index', { organization: organization.id })} className="hover:text-main">
                        ← Контрольные работы
                    </Link>
                    <span>/</span>
                    <span className="text-main font-medium truncate">{exam.title}</span>
                </nav>

                {/* Основная карточка */}
                <div className="glass-card p-6 md:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-main truncate flex items-center gap-2">
                                {exam.title}
                                {exam.is_active !== undefined && (
                                    <span
                                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{
                                            background: exam.is_active
                                                ? 'var(--color-success)'
                                                : 'var(--color-text-muted)',
                                        }}
                                        title={exam.is_active ? 'Активна' : 'Неактивна'}
                                    />
                                )}
                            </h1>
                            {exam.description && (
                                <p className="text-meta mt-2 line-clamp-4 whitespace-pre-wrap">{exam.description}</p>
                            )}
                        </div>
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

                    {/* Мета */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <MetaBadge label="Макс. балл" value={exam.max_score ?? 0} />
                        {exam.time_limit && (
                            <MetaBadge label="Время" value={`${exam.time_limit} мин`} />
                        )}
                        <MetaBadge label="Вопросов" value={exam.questions?.length ?? 0} />
                        {exam.is_active !== undefined && (
                            <MetaBadge
                                label="Статус"
                                value={
                                    <span className="inline-flex items-center gap-1">
                                        <span
                                            className="inline-block w-2 h-2 rounded-full"
                                            style={{
                                                background: exam.is_active
                                                    ? 'var(--color-success)'
                                                    : 'var(--color-text-muted)',
                                            }}
                                        />
                                        {exam.is_active ? 'Активна' : 'Неактивна'}
                                    </span>
                                }
                            />
                        )}
                        {parentModule && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm text-meta">Модуль:</span>
                                <Link
                                    href={route('module.show', { organization: organization.id, module: parentModule.id })}
                                    className="badge hover:underline"
                                >
                                    {parentModule.title}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Вопросы */}
                <div className="glass-card p-6 md:p-8">
                    <SortableQuestions
                        questions={exam.questions || []}
                        organizationId={organization.id}
                        parentType="exam"
                        parentId={exam.id}
                    />
                </div>
            </div>

            <EditExamForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                exam={exam}
                modules={modules.data}
                organization={organization}
                onSuccess={handleExamEdited}
            />
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Удаление контрольной работы"
                message={`Удалить «${exam.title}»? Вопросы также будут удалены.`}
                processing={isDeleting}
            />
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
