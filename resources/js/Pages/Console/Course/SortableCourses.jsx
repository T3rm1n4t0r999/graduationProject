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

    useImperativeHandle(ref, () => ({
        getOrderedCourses: () => localCourses,
    }));

    if (courses.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <p className="text-lg text-meta">Пока нет ни одного курса.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Кнопки управления */}
            <div className="flex justify-end mb-8">
                <div className="flex gap-3">
                    {!isReordering ? (
                        <button
                            onClick={handleStartReordering}
                            className="btn-ghost gap-2"
                        >
                            ⇅ Изменить порядок
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

            {/* Список */}
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
