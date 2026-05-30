import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { router } from "@inertiajs/react";
import { useState } from "react";
import SortableMaterialCard from "@/Pages/Console/LessonMaterial/SortableMaterialCard.jsx";
import CreateMaterialForm from "@/Pages/Console/LessonMaterial/CreateMaterialForm.jsx";

export default function SortableMaterials({ materials, organization, lesson }) {
    const [isMaterialReordering, setIsMaterialReordering] = useState(false);
    const [localMaterials, setLocalMaterials] = useState([]);
    const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const startReordering = () => {
        setLocalMaterials([...materials]);
        setIsMaterialReordering(true);
    };

    const cancelReordering = () => {
        setIsMaterialReordering(false);
    };

    const handleMaterialCreated = () => {
        setIsCreateMaterialModalOpen(false);
        router.reload({ only: ['materials'], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localMaterials.findIndex(m => m.id === active.id);
        const newIndex = localMaterials.findIndex(m => m.id === over.id);
        setLocalMaterials(arrayMove(localMaterials, oldIndex, newIndex));
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
                    <h2 className="text-xl font-semibold text-main">Материалы</h2>
                    <span className="badge">{materials.length || 0} шт.</span>
                </div>
                <div className="flex gap-2">
                    {!isMaterialReordering ? (
                        <>
                            <button
                                onClick={() => setIsCreateMaterialModalOpen(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                + Создать материал
                            </button>
                            <button onClick={startReordering} className="btn-ghost text-sm">
                                ⇅ Изменить порядок
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

            {/* Список материалов */}
            {materials.length === 0 ? (
                <p className="text-meta text-center py-8">Материалов пока нет.</p>
            ) : !isMaterialReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {materials.map(material => (
                        <SortableMaterialCard
                            key={material.id}
                            material={material}
                            organization={organization}
                            isReordering={isMaterialReordering}
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
                                    isReordering={isMaterialReordering}
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
