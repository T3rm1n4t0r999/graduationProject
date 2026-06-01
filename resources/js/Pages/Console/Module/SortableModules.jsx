import { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import CreateModuleForm from "@/Pages/Console/Module/CreateModuleForm.jsx";
import SortableModuleCard from "@/Pages/Console/Module/SortableModuleCard.jsx";

/**
 * Компонент сортировки модулей на странице курса.
 * Работает с уже загруженными модулями (course.modules).
 */
export default function SortableModules({ modules = [] }) {
    const [isReordering, setIsReordering] = useState(false);
    const [localModules, setLocalModules] = useState([]);
    const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedModuleId, setHighlightedModuleId] = useState(null);

    const { organization, course } = usePage().props;
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

    // Предупреждение при уходе со страницы с несохраненными изменениями
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
        setLocalModules([...modules]);
        setSearchQuery('');
        setHighlightedModuleId(null);
        setIsReordering(true);
    };

    const cancelReordering = () => {
        setIsReordering(false);
        setLocalModules([]);
        setSearchQuery('');
        setHighlightedModuleId(null);
    };

    const handleModuleCreated = () => {
        setIsCreateModuleModalOpen(false);
        router.reload({ only: ['course'], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localModules.findIndex(m => m.id === active.id);
        const newIndex = localModules.findIndex(m => m.id === over.id);
        setLocalModules(arrayMove(localModules, oldIndex, newIndex));
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setHighlightedModuleId(null);
            return;
        }

        const search = query.toLowerCase();
        const found = localModules.find(m =>
            m.title.toLowerCase().includes(search)
        );

        if (found) {
            setHighlightedModuleId(found.id);
            setTimeout(() => {
                const element = document.getElementById(`module-${found.id}`);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        } else {
            setHighlightedModuleId(null);
        }
    };

    const saveOrder = () => {
        const updatedItems = localModules.map((item, index) => ({
            id: item.id,
            order: index + 1,
        }));

        router.patch(
            route('module.reorder', {
                organization: organization.id,
                course: course.id,
            }),
            { items: updatedItems },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsReordering(false);
                    setLocalModules([]);
                    router.reload({ only: ['course'], preserveScroll: true });
                },
            }
        );
    };

    const displayModules = isReordering ? localModules : modules;

    return (
        <div>
            {/* Заголовок и кнопки управления */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-main">Модули</h2>
                    <span className="badge">{modules.length} шт.</span>
                </div>
                <div className="flex gap-2">
                    {!isReordering ? (
                        <>
                            <button
                                onClick={() => setIsCreateModuleModalOpen(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                + Создать модуль
                            </button>
                            {modules.length > 1 && (
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
                        💡 Перетащите карточки для изменения порядка модулей.
                    </div>

                    {localModules.length > 10 && (
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="🔍 Найти модуль для перемещения..."
                                className="form-input-glass w-full pl-10 pr-4 py-2.5"
                            />
                            {searchQuery && !highlightedModuleId && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-meta">
                                    Не найдено
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Список модулей */}
            {displayModules.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-meta mb-4">В этом курсе пока нет модулей.</p>
                    {!isReordering && (
                        <button
                            onClick={() => setIsCreateModuleModalOpen(true)}
                            className="btn-primary"
                        >
                            + Создать модуль
                        </button>
                    )}
                </div>
            ) : !isReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayModules.map(module => (
                        <SortableModuleCard
                            key={module.id}
                            organization={organization}
                            module={module}
                            isReordering={false}
                        />
                    ))}
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={localModules.map(m => m.id)} strategy={rectSortingStrategy}>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {localModules.map(module => (
                                <SortableModuleCard
                                    key={module.id}
                                    organization={organization}
                                    module={module}
                                    isReordering={true}
                                    isHighlighted={highlightedModuleId === module.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <CreateModuleForm
                isOpen={isCreateModuleModalOpen}
                onClose={() => setIsCreateModuleModalOpen(false)}
                organization={organization}
                course={course}
                onSuccess={handleModuleCreated}
            />
        </div>
    );
}
