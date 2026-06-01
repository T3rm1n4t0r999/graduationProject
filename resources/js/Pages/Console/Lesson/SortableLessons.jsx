import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import CreateLessonForm from "@/Pages/Console/Lesson/CreateLessonForm.jsx";
import SortableLessonCard from "@/Pages/Console/Lesson/SortableLessonCard.jsx";

export default function SortableLessons({ lessons, organization, module }) {
    const [isReordering, setIsReordering] = useState(false);
    const [localLessons, setLocalLessons] = useState([]);
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedLessonId, setHighlightedLessonId] = useState(null);

    const searchInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    // Автофокус на поиске при активации режима
    useEffect(() => {
        if (isReordering && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isReordering]);

    // Защита от потери несохраненных изменений
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isReordering) {
                e.preventDefault();
                e.returnValue = 'У вас есть несохраненные изменения порядка. Уйти?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isReordering]);

    const startReordering = () => {
        setLocalLessons([...lessons]);
        setSearchQuery('');
        setHighlightedLessonId(null);
        setIsReordering(true);
    };

    const cancelReordering = () => {
        setIsReordering(false);
        setLocalLessons([]);
        setSearchQuery('');
        setHighlightedLessonId(null);
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

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setHighlightedLessonId(null);
            return;
        }

        const search = query.toLowerCase();
        const found = localLessons.find(l =>
            l.title.toLowerCase().includes(search)
        );

        if (found) {
            setHighlightedLessonId(found.id);
            setTimeout(() => {
                const element = document.getElementById(`lesson-${found.id}`);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        } else {
            setHighlightedLessonId(null);
        }
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
                    setLocalLessons([]);
                    router.reload({ only: ['module'], preserveScroll: true });
                },
            }
        );
    };

    const displayLessons = isReordering ? localLessons : lessons;

    return (
        <div>
            {/* Заголовок и кнопки управления */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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
                            {lessons.length > 1 && (
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
            {isReordering && (
                <div className="mb-4 space-y-3">
                    <div className="p-3 rounded-lg text-sm"
                         style={{
                             background: 'var(--color-accent-amber-light)',
                             color: 'var(--color-accent-amber)'
                         }}>
                        💡 Перетащите карточки для изменения порядка уроков.
                    </div>

                    {localLessons.length > 10 && (
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="🔍 Найти урок для перемещения..."
                                className="form-input-glass w-full pl-10 pr-4 py-2.5"
                            />
                            {searchQuery && !highlightedLessonId && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-meta">
                                    Не найдено
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Список уроков */}
            {displayLessons.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-meta mb-4">В этом модуле пока нет уроков.</p>
                    {!isReordering && (
                        <button
                            onClick={() => setIsCreateLessonModalOpen(true)}
                            className="btn-primary"
                        >
                            + Создать урок
                        </button>
                    )}
                </div>
            ) : !isReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayLessons.map(lesson => (
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
                                    isHighlighted={highlightedLessonId === lesson.id}
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
