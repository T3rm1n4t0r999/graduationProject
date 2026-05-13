import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { router } from "@inertiajs/react";
import { useState } from "react";
import SortableLessonTaskCard from "@/Pages/Console/LessonTask/SortableLessonTaskCard.jsx";


export default function SortableLessonTasks({ tasks, organization, lesson }) {
    const [items, setItems] = useState(tasks);
    const [isReordering, setIsReordering] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const toggleReordering = () => {
        setIsReordering((prev) => !prev);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);

        setItems(reordered);

        // Отправляем новый порядок на сервер
        router.patch(
            route("lesson.tasks.reorder", {
                organization: organization.id,
                lesson: lesson.id,
            }),
            {
                tasks: reordered.map((task, index) => ({
                    id: task.id,
                    order: index + 1,
                })),
            },
            {
                preserveScroll: true,
                onError: () => {
                    // При ошибке возвращаем исходный порядок
                    setItems(tasks);
                },
                onFinish: () => {
                    // Можно сохранить состояние
                },
            }
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Задания урока
                </h2>
                <button onClick={toggleReordering} className="btn-ghost text-sm">
                    {isReordering ? "Готово" : "Изменить порядок"}
                </button>
            </div>

            {items.length === 0 ? (
                <p style={{ color: "var(--color-text-muted)" }}>
                    Нет заданий для отображения.
                </p>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((task) => (
                                <SortableLessonTaskCard
                                    key={task.id}
                                    task={task}
                                    organization={organization}
                                    lesson={lesson}
                                    isReordering={isReordering}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
