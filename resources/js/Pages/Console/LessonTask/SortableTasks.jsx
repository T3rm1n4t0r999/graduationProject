import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import SortableTaskCard from "@/Pages/Console/LessonTask/SortableTaskCard.jsx";
import CreateTaskForm from "@/Pages/Console/LessonTask/CreateTaskForm.jsx";

export default function SortableTasks({ tasks, organization, lesson }) {
    const [isTaskReordering, setIsTaskReordering] = useState(false);
    const [localTasks, setLocalTasks] = useState([]);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedTaskId, setHighlightedTaskId] = useState(null);

    const searchInputRef = useRef(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Автофокус на поиске при активации режима
    useEffect(() => {
        if (isTaskReordering && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isTaskReordering]);

    // Защита от потери несохраненных изменений
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isTaskReordering) {
                e.preventDefault();
                e.returnValue = 'У вас есть несохраненные изменения порядка. Уйти?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isTaskReordering]);

    const startReordering = () => {
        setLocalTasks([...tasks]);
        setSearchQuery('');
        setHighlightedTaskId(null);
        setIsTaskReordering(true);
    };

    const cancelReordering = () => {
        setIsTaskReordering(false);
        setLocalTasks([]);
        setSearchQuery('');
        setHighlightedTaskId(null);
    };

    const handleTaskCreated = () => {
        setIsCreateTaskModalOpen(false);
        router.reload({ only: ['lesson'], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localTasks.findIndex(m => m.id === active.id);
        const newIndex = localTasks.findIndex(m => m.id === over.id);
        setLocalTasks(arrayMove(localTasks, oldIndex, newIndex));
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setHighlightedTaskId(null);
            return;
        }

        const search = query.toLowerCase();
        const found = localTasks.find(t =>
            t.title.toLowerCase().includes(search)
        );

        if (found) {
            setHighlightedTaskId(found.id);
            setTimeout(() => {
                const element = document.getElementById(`task-${found.id}`);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        } else {
            setHighlightedTaskId(null);
        }
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
                    setLocalTasks([]);
                    router.reload({ only: ['lesson'], preserveScroll: true });
                },
            }
        );
    };

    const displayTasks = isTaskReordering ? localTasks : tasks;

    return (
        <div>
            {/* Заголовок и кнопки управления */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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
                            {tasks.length > 1 && (
                                <button onClick={startReordering} className="btn-ghost text-sm">
                                    ⇅ Изменить порядок
                                </button>
                            )}
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

            {/* Информационное сообщение и поиск в режиме сортировки */}
            {isTaskReordering && (
                <div className="mb-4 space-y-3">
                    <div className="p-3 rounded-lg text-sm"
                         style={{
                             background: 'var(--color-accent-amber-light)',
                             color: 'var(--color-accent-amber)'
                         }}>
                        💡 Перетащите карточки для изменения порядка заданий.
                    </div>

                    {localTasks.length > 10 && (
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="🔍 Найти задание для перемещения..."
                                className="form-input-glass w-full pl-10 pr-4 py-2.5"
                            />
                            {searchQuery && !highlightedTaskId && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-meta">
                                    Не найдено
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Список заданий */}
            {displayTasks.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-meta mb-4">В этом уроке пока нет заданий.</p>
                    {!isTaskReordering && (
                        <button
                            onClick={() => setIsCreateTaskModalOpen(true)}
                            className="btn-primary"
                        >
                            + Создать задание
                        </button>
                    )}
                </div>
            ) : !isTaskReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayTasks.map(task => (
                        <SortableTaskCard
                            key={task.id}
                            task={task}
                            organization={organization}
                            isReordering={false}
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
                                    isReordering={true}
                                    isHighlighted={highlightedTaskId === task.id}
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
