import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import SortableMaterialCard from "@/Pages/Console/LessonMaterial/SortableMaterialCard.jsx";
import CreateMaterialForm from "@/Pages/Console/LessonMaterial/CreateMaterialForm.jsx";

export default function SortableMaterials({ materials, organization, lesson }) {
    const [isMaterialReordering, setIsMaterialReordering] = useState(false);
    const [localMaterials, setLocalMaterials] = useState([]);
    const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedMaterialId, setHighlightedMaterialId] = useState(null);

    const searchInputRef = useRef(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Автофокус на поиске при активации режима
    useEffect(() => {
        if (isMaterialReordering && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isMaterialReordering]);

    // Защита от потери несохраненных изменений
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isMaterialReordering) {
                e.preventDefault();
                e.returnValue = 'У вас есть несохраненные изменения порядка. Уйти?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isMaterialReordering]);

    const startReordering = () => {
        setLocalMaterials([...materials]);
        setSearchQuery('');
        setHighlightedMaterialId(null);
        setIsMaterialReordering(true);
    };

    const cancelReordering = () => {
        setIsMaterialReordering(false);
        setLocalMaterials([]);
        setSearchQuery('');
        setHighlightedMaterialId(null);
    };

    const handleMaterialCreated = () => {
        setIsCreateMaterialModalOpen(false);
        // ✅ Перезагружаем lesson, так как материалы отображаются на странице урока
        router.reload({ only: ['lesson'], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localMaterials.findIndex(m => m.id === active.id);
        const newIndex = localMaterials.findIndex(m => m.id === over.id);
        setLocalMaterials(arrayMove(localMaterials, oldIndex, newIndex));
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setHighlightedMaterialId(null);
            return;
        }

        const search = query.toLowerCase();
        const found = localMaterials.find(m => m.title.toLowerCase().includes(search));

        if (found) {
            setHighlightedMaterialId(found.id);
            setTimeout(() => {
                document.getElementById(`material-${found.id}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        } else {
            setHighlightedMaterialId(null);
        }
    };

    const saveOrder = () => {
        const updatedItems = localMaterials.map((item, index) => ({
            id: item.id,
            order: index + 1,
        }));

        router.patch(
            route('material.reorder', {
                organization: organization.id,
                lesson: lesson.id,
            }),
            { items: updatedItems },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsMaterialReordering(false);
                    setLocalMaterials([]);
                    router.reload({ only: ['lesson'], preserveScroll: true });
                },
            }
        );
    };

    const displayMaterials = isMaterialReordering ? localMaterials : materials;

    return (
        <div>
            {/* Заголовок и кнопки управления */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-main">Материалы</h2>
                    <span className="badge">{materials.length || 0} шт.</span>
                </div>
                <div className="flex gap-2">
                    {!isMaterialReordering ? (
                        <>
                            <button onClick={() => setIsCreateMaterialModalOpen(true)} className="btn-primary flex items-center gap-2">
                                + Создать материал
                            </button>
                            {materials.length > 1 && (
                                <button onClick={startReordering} className="btn-ghost text-sm">
                                    ⇅ Изменить порядок
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button onClick={saveOrder} className="btn-primary text-sm">Сохранить</button>
                            <button onClick={cancelReordering} className="btn-ghost text-sm">Отмена</button>
                        </>
                    )}
                </div>
            </div>

            {/* Информационное сообщение и поиск в режиме сортировки */}
            {isMaterialReordering && (
                <div className="mb-4 space-y-3">
                    <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--color-accent-amber-light)', color: 'var(--color-accent-amber)' }}>
                        💡 Перетащите карточки для изменения порядка материалов.
                    </div>
                    {localMaterials.length > 5 && (
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="🔍 Найти материал для перемещения..."
                                className="form-input-glass w-full pl-10 pr-4 py-2.5"
                            />
                            {searchQuery && !highlightedMaterialId && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-meta">Не найдено</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Список материалов */}
            {displayMaterials.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-meta mb-4">В этом уроке пока нет материалов.</p>
                    {!isMaterialReordering && (
                        <button onClick={() => setIsCreateMaterialModalOpen(true)} className="btn-primary">
                            + Создать материал
                        </button>
                    )}
                </div>
            ) : !isMaterialReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayMaterials.map(material => (
                        <SortableMaterialCard
                            key={material.id}
                            material={material}
                            organization={organization}
                            isReordering={false}
                        />
                    ))}
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={localMaterials.map(m => m.id)} strategy={rectSortingStrategy}>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {localMaterials.map(material => (
                                <SortableMaterialCard
                                    key={material.id}
                                    material={material}
                                    organization={organization}
                                    isReordering={true}
                                    isHighlighted={highlightedMaterialId === material.id}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <CreateMaterialForm
                isOpen={isCreateMaterialModalOpen}
                onClose={() => setIsCreateMaterialModalOpen(false)}
                organization={organization}
                lesson={lesson}
                onSuccess={handleMaterialCreated}
            />
        </div>
    );
}
