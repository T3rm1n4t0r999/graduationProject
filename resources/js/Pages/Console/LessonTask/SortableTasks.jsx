import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { router } from "@inertiajs/react";
import { useState } from "react";
import SortableTaskCard from "@/Pages/Console/LessonTask/SortableTaskCard.jsx";
import CreateTaskForm from "@/Pages/Console/LessonTask/CreateTaskForm.jsx";

export default function SortableTasks({ tasks, organization, lesson }) {
    const [isTaskReordering, setIsTaskReordering] = useState(false);
    const [localTasks, setLocalTasks] = useState([]);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const startReordering = () => {
        setLocalTasks([...tasks]);
        setIsTaskReordering(true);
    };

    const cancelReordering = () => {
        setIsTaskReordering(false);
    };

    const handleTaskCreated = () => {
        setIsCreateTaskModalOpen(false);
        router.reload({ only: ['tasks'], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localTasks.findIndex(m => m.id === active.id);
        const newIndex = localTasks.findIndex(m => m.id === over.id);
        setLocalTasks(arrayMove(localTasks, oldIndex, newIndex));
    };

    const saveOrder = () => {
        const updatedItems = localTasks.map((item, index) => ({
            id: item.id,
            order: index + 1,
        }));

        router.patch(
            route('task.reorder', {
                organization: organization.id,
                lesson: lesson.id,
            }),
            { items: updatedItems },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsTaskReordering(false);
                    router.reload({ only: ['lesson'], preserveScroll: true });
                },
            }
        );
    };

    return (
        <div>
            {/* Заголовок и кнопки управления */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-main">Задания</h2>
                    <span className="badge">{tasks.length || 0} шт.</span>
                </div>
                <div className="flex gap-2">
                    {!isTaskReordering ? (
                        <>
                            <button
                                onClick={() => setIsCreateTaskModalOpen(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                + Создать задание
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

            {/* Список заданий */}
            {tasks.length === 0 ? (
                <p className="text-meta text-center py-8">Заданий пока нет.</p>
            ) : !isTaskReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tasks.map(task => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            organization={organization}
                            isReordering={isTaskReordering}
                        />
                    ))}
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={localTasks.map(m => m.id)} strategy={rectSortingStrategy}>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {localTasks.map(task => (
                                <SortableTaskCard
                                    key={task.id}
                                    task={task}
                                    organization={organization}
                                    isReordering={isTaskReordering}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <CreateTaskForm
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                organization={organization}
                lesson={lesson}
                onSuccess={handleTaskCreated}
            />
        </div>
    );
}
