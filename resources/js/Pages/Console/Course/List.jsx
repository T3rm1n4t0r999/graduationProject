// resources/js/Pages/Console/Courses/List.jsx
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import CreateCourseForm from '@/Pages/Console/Course/CreateCourseForm';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableCourseCard from "@/Pages/Console/Course/SortableCourseCard.jsx";

export default function List({ auth, organization, courses }) {
    const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [localCourses, setLocalCourses] = useState([]);
    // Настройка сенсоров
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    useEffect(() => {
        if (isReordering) {
            setLocalCourses([...courses]);
        }
    }, [isReordering, courses]);

    const handleCourseCreated = () => {
        setIsCreateCourseModalOpen(false);
        router.reload({ only: ['courses'], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = localCourses.findIndex(
            (item) => item.id === active.id
        );
        const newIndex = localCourses.findIndex(
            (item) => item.id === over.id
        );
        setLocalCourses(arrayMove(localCourses, oldIndex, newIndex));
    };

    const handleSaveOrder = () => {
        const updatedItems = localCourses.map((item, index) => ({
            id: item.id,
            order: index + 1,
        }));

        router.patch(
            route('course.reorder', { organization: organization.id }),
            { items: updatedItems },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsReordering(false);
                    router.reload({ only: ['courses'], preserveScroll: true });
                },
            }
        );
    };

    const handleCancelReordering = () => {
        setIsReordering(false);
    };

    return (
        <ConsoleLayout
            auth={auth}
            organization={organization}
            header={
                <h1
                    className="text-2xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    Курсы
                </h1>
            }
        >
            <div className="max-w-6xl mx-auto">
                {/* Верхняя панель управления */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <button
                        onClick={() => setIsCreateCourseModalOpen(true)}
                        className="btn-primary"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        Создать курс
                    </button>

                    <div className="flex gap-3">
                        {!isReordering ? (
                            <button
                                onClick={() => setIsReordering(true)}
                                className="btn-ghost"
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
                                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                </svg>
                                Изменить порядок
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSaveOrder}
                                    className="btn-primary"
                                >
                                    Сохранить
                                </button>
                                <button
                                    onClick={handleCancelReordering}
                                    className="btn-ghost"
                                >
                                    Отмена
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {courses.data.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <p
                            className="text-lg"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Пока нет ни одного курса.
                        </p>
                    </div>
                ) : (
                    <>
                        {!isReordering ? (
                            /* Обычный grid */
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {courses.data.map((course) => (
                                    <SortableCourseCard
                                        key={course.id}
                                        organization={organization}
                                        course={course}
                                        isReordering={false}
                                    />
                                ))}
                            </div>
                        ) : (
                            /* Drag-and-drop с сеткой */
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={localCourses.map((c) => c.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {localCourses.map((course) => (
                                            <SortableCourseCard
                                                key={course.id}
                                                course={course}
                                                isReordering={true}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </>
                )}
            </div>

            <CreateCourseForm
                isOpen={isCreateCourseModalOpen}
                onClose={() => setIsCreateCourseModalOpen(false)}
                organization={organization}
                onSuccess={handleCourseCreated}
            />
        </ConsoleLayout>
    );
}
