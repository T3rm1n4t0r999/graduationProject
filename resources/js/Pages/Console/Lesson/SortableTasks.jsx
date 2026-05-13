import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy, arrayMove, rectSortingStrategy} from "@dnd-kit/sortable";
import {Link, router, usePage} from "@inertiajs/react";
import { useState } from "react";
import SortableTaskCard from "@/Pages/Console/Lesson/SortableTaskCard.jsx";
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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Задания
                    </h2>
                    <span className="text-sm px-3 py-1 rounded-full" style={{ background: 'var(--color-bg-card-hover)', color: 'var(--color-text-muted)' }}>
                        {tasks.length || 0} шт.
                    </span>
                </div>
                <div className="flex gap-2">

                    {!isTaskReordering ? (
                        <>
                            <button onClick={() => setIsCreateTaskModalOpen(true)} className="btn-primary">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Создать задание
                            </button>
                            <button onClick={startReordering} className="btn-ghost text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                Изменить порядок
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={saveOrder} className="btn-primary text-sm">Сохранить</button>
                            <button onClick={cancelReordering} className="btn-ghost text-sm">Отмена</button>
                        </>
                    )}
                </div>
            </div>

            {tasks.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Модулей пока нет.</p>
            ) : !isTaskReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tasks.map(task => (
                        <Link
                            key={task.id}
                            href={route('task.show', {
                                organization: organization.id,
                                task: task.id,
                            })}
                            className="block"
                        >
                            <SortableTaskCard
                                organization={organization}
                                task={task}
                                isReordering={false} />
                        </Link>
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
                                    lesson={lesson}
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
