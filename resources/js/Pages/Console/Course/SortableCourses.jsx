import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableCourseCard from "@/Pages/Console/Course/SortableCourseCard.jsx";


const SortableCourses = forwardRef(({ organization, courses, onSaveOrder }, ref) => {
    const [isReordering, setIsReordering] = useState(false);
    const [localCourses, setLocalCourses] = useState([]);

    // При включении режима сортировки копируем courses в локальное состояние
    useEffect(() => {
        if (isReordering && courses.length) {
            setLocalCourses([...courses]);
        }
    }, [isReordering, courses]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = localCourses.findIndex((item) => item.id === active.id);
        const newIndex = localCourses.findIndex((item) => item.id === over.id);
        setLocalCourses((prev) => arrayMove(prev, oldIndex, newIndex));
    };

    const handleStartReordering = () => {
        setIsReordering(true);
    };

    const handleSaveOrder = async () => {
        if (onSaveOrder && localCourses.length) {
            const updatedItems = localCourses.map((item, index) => ({
                id: item.id,
                order: index + 1,
            }));
            await onSaveOrder(updatedItems);
        }
        setIsReordering(false);
    };

    const handleCancelReordering = () => {
        setIsReordering(false);
    };

    // Для доступа к текущему порядку извне (хотя теперь не нужно, т.к. сохранение внутри)
    useImperativeHandle(ref, () => ({
        getOrderedCourses: () => localCourses,
    }));

    // Пустое состояние
    if (courses.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                    Пока нет ни одного курса.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Блок кнопок переключения режима */}
            <div className="flex justify-end mb-8">
                <div className="flex gap-3">
                    {!isReordering ? (
                        <button onClick={handleStartReordering} className="btn-ghost">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            Изменить порядок
                        </button>
                    ) : (
                        <>
                            <button onClick={handleSaveOrder} className="btn-primary">
                                Сохранить
                            </button>
                            <button onClick={handleCancelReordering} className="btn-ghost">
                                Отмена
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Рендер списка в зависимости от режима */}
            {!isReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <SortableCourseCard
                            key={course.id}
                            organization={organization}
                            course={course}
                            isReordering={false}
                        />
                    ))}
                </div>
            ) : (
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
                                    organization={organization}
                                    course={course}
                                    isReordering={true}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
});

export default SortableCourses;
