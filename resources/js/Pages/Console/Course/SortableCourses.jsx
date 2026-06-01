import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
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

const SortableCourses = forwardRef(({ organization, courses, onSaveOrder, onReorderingChange}, ref) => {
    const [isReordering, setIsReordering] = useState(false);
    const [localCourses, setLocalCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalCourses, setTotalCourses] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedCourseId, setHighlightedCourseId] = useState(null);

    const loaderRef = useRef(null);
    const searchInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    // Загрузка следующего блока курсов
    const loadMoreCourses = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const offset = localCourses.length;
            const response = await axios.get(
                route('course.all', { organization: organization.id }),
                { params: { limit: 100, offset } }
            );

            setLocalCourses(prev => [...prev, ...response.data.data]);
            setHasMore(response.data.has_more);
            setTotalCourses(response.data.total);
        } catch (error) {
            console.error('Ошибка загрузки курсов:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        onReorderingChange?.(isReordering);
    }, [isReordering, onReorderingChange]);

    // IntersectionObserver для отслеживания скролла
    useEffect(() => {
        if (!isReordering || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading) {
                    loadMoreCourses();
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [isReordering, hasMore, isLoading, localCourses.length]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = localCourses.findIndex((item) => item.id === active.id);
        const newIndex = localCourses.findIndex((item) => item.id === over.id);
        setLocalCourses((prev) => arrayMove(prev, oldIndex, newIndex));
    };

    // При активации режима сортировки - загружаем первый блок
    const handleStartReordering = async () => {
        setIsLoading(true);
        setLocalCourses([]);
        setHasMore(true);
        setSearchQuery('');
        setHighlightedCourseId(null);

        try {
            const response = await axios.get(
                route('course.all', { organization: organization.id }),
                { params: { limit: 100, offset: 0 } }
            );
            setLocalCourses(response.data.data);
            setHasMore(response.data.has_more);
            setTotalCourses(response.data.total);
            setIsReordering(true);
        } catch (error) {
            console.error('Ошибка загрузки курсов:', error);
            alert('Не удалось загрузить курсы для сортировки');
        } finally {
            setIsLoading(false);
        }
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
        setLocalCourses([]);
        setHasMore(true);
        setSearchQuery('');
        setHighlightedCourseId(null);
    };

    const handleCancelReordering = () => {
        setIsReordering(false);
        setLocalCourses([]);
        setHasMore(true);
        setSearchQuery('');
        setHighlightedCourseId(null);
    };

    // Поиск курса и прокрутка к нему
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setHighlightedCourseId(null);
            return;
        }

        const search = query.toLowerCase();
        const found = localCourses.find(c =>
            c.title.toLowerCase().includes(search)
        );

        if (found) {
            setHighlightedCourseId(found.id);
            setTimeout(() => {
                const element = document.getElementById(`course-${found.id}`);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        } else {
            setHighlightedCourseId(null);
        }
    };

    // Предупреждение при попытке уйти со страницы
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

    // Автофокус на поиске при активации режима сортировки
    useEffect(() => {
        if (isReordering && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isReordering]);

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
                            disabled={isLoading}
                            className="btn-ghost gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Загрузка...
                                </>
                            ) : (
                                '⇅ Изменить порядок'
                            )}
                        </button>
                    ) : (
                        <>
                            <div className="text-sm text-meta self-center mr-2">
                                Загружено: <span className="font-semibold text-main">{localCourses.length}</span> из {totalCourses}
                            </div>
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

            {/* Информационное сообщение и поиск в режиме сортировки */}
            {isReordering && (
                <div className="mb-4 space-y-3">
                    <div className="p-3 rounded-lg text-sm"
                         style={{
                             background: 'var(--color-accent-amber-light)',
                             color: 'var(--color-accent-amber)'
                         }}>
                        💡 В режиме сортировки показаны <strong>все курсы</strong> организации (загружаются по 100).
                        Перетащите карточки для изменения порядка.
                    </div>

                    {/* Поиск курсов */}
                    {localCourses.length > 20 && (
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="🔍 Найти курс для перемещения..."
                                className="form-input-glass w-full pl-10 pr-4 py-2.5"
                            />
                            {searchQuery && !highlightedCourseId && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-meta">
                                    Не найдено
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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
                <>
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
                                        isHighlighted={highlightedCourseId === course.id}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* Индикатор загрузки и триггер для подгрузки */}
                    {hasMore && (
                        <div ref={loaderRef} className="flex justify-center items-center py-8">
                            {isLoading ? (
                                <div className="flex items-center gap-3 text-meta">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span>Загрузка курсов...</span>
                                </div>
                            ) : (
                                <div className="text-sm text-meta">
                                    Прокрутите вниз для загрузки ещё
                                </div>
                            )}
                        </div>
                    )}

                    {!hasMore && localCourses.length > 0 && (
                        <div className="text-center py-6 text-sm text-meta">
                            ✓ Все {totalCourses} курсов загружены
                        </div>
                    )}
                </>
            )}
        </div>
    );
});

export default SortableCourses;
