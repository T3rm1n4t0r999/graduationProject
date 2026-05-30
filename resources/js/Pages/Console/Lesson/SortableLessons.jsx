import { useState } from 'react';
import { router } from '@inertiajs/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import CreateLessonForm from "@/Pages/Console/Lesson/CreateLessonForm.jsx";
import SortableLessonCard from "@/Pages/Console/Lesson/SortableLessonCard.jsx";

export default function SortableLessons({ lessons, organization, module }) {
    const [isReordering, setIsReordering] = useState(false);
    const [localLessons, setLocalLessons] = useState([]);
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const startReordering = () => {
        setLocalLessons([...lessons]);
        setIsReordering(true);
    };

    const cancelReordering = () => {
        setIsReordering(false);
    };

    const handleLessonCreated = () => {
        setIsCreateLessonModalOpen(false);
        router.reload({ only: ['module'], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localLessons.findIndex(l => l.id === active.id);
        const newIndex = localLessons.findIndex(l => l.id === over.id);
        setLocalLessons(arrayMove(localLessons, oldIndex, newIndex));
    };

    const saveOrder = () => {
        const updatedItems = localLessons.map((item, index) => ({
            id: item.id,
            order: index + 1,
        }));

        router.patch(
            route('lesson.reorder', {
                organization: organization.id,
                module: module.id,
            }),
            { items: updatedItems },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsReordering(false);
                    router.reload({ only: ['module'], preserveScroll: true });
                },
            }
        );
    };

    return (
        <div>
            {/* Заголовок и кнопки управления */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-main">Уроки</h2>
                    <span className="badge">{lessons.length || 0} шт.</span>
                </div>
                <div className="flex gap-2">
                    {!isReordering ? (
                        <>
                            <button
                                onClick={() => setIsCreateLessonModalOpen(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                + Создать урок
                            </button>
                            <button
                                onClick={startReordering}
                                className="btn-ghost text-sm"
                            >
                                ⇅ Изменить порядок
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={saveOrder} className="btn-primary text-sm">
                                Сохранить
                            </button>
                            <button onClick={cancelReordering} className="btn-ghost text-sm">
                                Отмена
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Список уроков */}
            {lessons.length === 0 ? (
                <p className="text-meta text-center py-8">Уроков пока нет.</p>
            ) : !isReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {lessons.map(lesson => (
                        <SortableLessonCard
                            key={lesson.id}
                            lesson={lesson}
                            organization={organization}
                            isReordering={false}
                        />
                    ))}
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={localLessons.map(l => l.id)} strategy={rectSortingStrategy}>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {localLessons.map(lesson => (
                                <SortableLessonCard
                                    key={lesson.id}
                                    lesson={lesson}
                                    organization={organization}
                                    isReordering={true}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <CreateLessonForm
                isOpen={isCreateLessonModalOpen}
                onClose={() => setIsCreateLessonModalOpen(false)}
                organization={organization}
                module={module}
                onSuccess={handleLessonCreated}
            />
        </div>
    );
}
