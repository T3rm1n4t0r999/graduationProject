import { useState } from 'react';
import {Link, router, usePage} from '@inertiajs/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CreateLessonForm from "@/Pages/Console/Lesson/CreateLessonForm.jsx";

function SortableLessonItem({ lesson, isReordering }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
    };

    const content = (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`glass-card p-4 hover:shadow-md transition-shadow flex items-center gap-4 ${isReordering ? 'cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'shadow-lg z-30' : ''}`}
        >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
                {lesson.order}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {lesson.title}
                </h3>
                {lesson.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {lesson.description}
                    </p>
                )}
            </div>
            {isReordering && (
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--color-text-muted)' }}>
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            )}
        </div>
    );

    return content;
}

export default function SortableLessons({ lessons}) {
    const [isReordering, setIsReordering] = useState(false);
    const [localLessons, setLocalLessons] = useState([]);
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
    const {organization, module} = usePage().props;
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const startReordering = () => {
        setLocalLessons([...lessons]);
        setIsReordering(true);
    };

    const cancelReordering = () => {
        setIsReordering(false);
    };

    const handleLessonCreated = () => {
        setIsCreateLessonModalOpen(false);
        router.reload({ only: ['lessons'], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localLessons.findIndex(m => m.id === active.id);
        const newIndex = localLessons.findIndex(m => m.id === over.id);
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
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            Уроки
                        </h2>
                        <span className="text-sm px-3 py-1 rounded-full" style={{ background: 'var(--color-bg-card-hover)', color: 'var(--color-text-muted)' }}>
                        {lessons.length || 0} шт.
                    </span>
                    </div>
                </h2>
                <div className="flex gap-2">

                    {!isReordering ? (
                        <>
                            <button
                                onClick={() => setIsCreateLessonModalOpen(true)} className="btn-primary">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Создать урок
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

            {lessons.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Модулей пока нет.</p>
            ) : !isReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {lessons.map(lesson => (
                        <Link
                            key={lesson.id}
                            href={route('lesson.show', {
                                organization: organization.id,
                                lesson: lesson.id,
                            })}
                            className="block"
                        >
                            <SortableLessonItem lesson={lesson} isReordering={false} />
                        </Link>
                    ))}
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={localLessons.map(m => m.id)} strategy={rectSortingStrategy}>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {localLessons.map(lesson => (
                                <SortableLessonItem key={lesson.id} lesson={lesson} isReordering={true} />
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
