// resources/js/Pages/Console/Modules/Show.jsx
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router, usePage } from '@inertiajs/react';
import EditModuleForm from '@/Pages/Console/Module/EditModuleForm';
import { useState } from 'react';
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal.jsx";
import SortableModules from "@/Pages/Console/Course/SortableModuleItem.jsx";
import SortableLessons from "@/Pages/Console/Module/SortableLessonItem.jsx";

export default function Show({ auth, organization, module, courses }) {
    const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
                        href={route('module.index', organization.id)}
                        className="hover:underline"
                    >
                        Модули
                    </Link>
                    <span>/</span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{module.title}</span>
                </nav>

                {/* Карточка модуля */}
                <div className="glass-card p-8 mb-8">
                    <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {module.title}
                        </h1>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditModuleModalOpen(true)}
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
                                Удалить модуль
                            </button>
                        </div>
                    </div>

                    <div className="prose max-w-none mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                        <p className="whitespace-pre-wrap">
                            {module.description || 'Описание отсутствует'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        <span>Порядковый номер: {module.order}</span>
                    </div>
                </div>

                {/* Уроки модуля */}
                <div className="glass-card p-8">
                    <SortableLessons
                        lessons={module.lessons}
                        organization={organization.id}
                        module={module.id}
                    />
                </div>
            </div>

            {/* Модальные окна */}
            <EditModuleForm
                isOpen={isEditModuleModalOpen}
                onClose={() => setIsEditModuleModalOpen(false)}
                module={module}
                courses={courses.data}
                organization={organization}
                onSuccess={handleModuleEdited}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Удаление курса"
                message={`Вы действительно хотите удалить курс «${module.title}»? Все модули и уроки внутри курса также будут удалены. Это действие нельзя отменить.`}
                processing={isDeleting}
            />
        </ConsoleLayout>
    );
}
