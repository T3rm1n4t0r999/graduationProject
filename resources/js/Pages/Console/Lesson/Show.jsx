import ConsoleLayout from "@/Layouts/ConsoleLayout";
import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal";
import EditLessonForm from "@/Pages/Console/Lesson/EditLessonForm";
import SortableTasks from "@/Pages/Console/Lesson/SortableTasks.jsx";
import SortableMaterials from "@/Pages/Console/Lesson/SortableMaterials.jsx";

export default function Show({ auth, organization, lesson, modules }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const handleLessonEdited = () => {
        setIsEditModalOpen(false);
        router.reload({ only: ["lesson"], preserveScroll: true });
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

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-4xl mx-auto">
                {/* Хлебные крошки */}
                <nav
                    className="flex items-center gap-2 text-sm mb-6"
                    style={{ color: "var(--color-text-muted)" }}
                >
                    <Link
                        href={route("lesson.index", organization.id)}
                        className="hover:underline"
                    >
                        Уроки
                    </Link>
                    <span>/</span>
                    <span style={{ color: "var(--color-text-primary)" }}>
            {lesson.title}
          </span>
                </nav>

                {/* Карточка урока */}
                <div className="glass-card p-8 mb-8">
                    <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                        <h1
                            className="text-3xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {lesson.title}
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
                                style={{ color: "var(--color-error)" }}
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
                                Удалить урок
                            </button>
                        </div>
                    </div>

                    <div
                        className="prose max-w-none mb-6"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        <p className="whitespace-pre-wrap">
                            {lesson.description || "Описание отсутствует"}
                        </p>
                    </div>

                    <div
                        className="flex items-center gap-4 text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        <span>Порядковый номер: {lesson.order}</span>
                    </div>
                </div>

                {/* Задания урока */}
                <div className="glass-card p-8">
                    <SortableTasks
                        tasks={lesson.tasks ?? []}
                        organization={organization}
                        lesson={lesson}
                    />
                </div>

                <div className="glass-card p-8 mt-8">
                    <SortableMaterials
                        materials={lesson.materials ?? []}
                        organization={organization}
                        lesson={lesson}
                    />
                </div>
            </div>

            {/* Модальные окна */}
            <EditLessonForm
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                lesson={lesson}
                modules={modules.data}
                organization={organization}
                onSuccess={handleLessonEdited}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Удаление урока"
                message={`Вы действительно хотите удалить урок «${lesson.title}»? Все задания внутри урока также будут удалены. Это действие нельзя отменить.`}
                processing={isDeleting}
            />
        </ConsoleLayout>
    );
}
