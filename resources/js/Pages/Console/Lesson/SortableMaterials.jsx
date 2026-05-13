import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy, arrayMove, rectSortingStrategy} from "@dnd-kit/sortable";
import {Link, router, usePage} from "@inertiajs/react";
import { useState } from "react";
import SortableMaterialCard from "@/Pages/Console/Lesson/SortableMaterialCard.jsx";
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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Материалы
                    </h2>
                    <span className="text-sm px-3 py-1 rounded-full" style={{ background: 'var(--color-bg-card-hover)', color: 'var(--color-text-muted)' }}>
                        {materials.length || 0} шт.
                    </span>
                </div>
                <div className="flex gap-2">

                    {!isMaterialReordering ? (
                        <>
                            <button onClick={() => setIsCreateMaterialModalOpen(true)} className="btn-primary">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Создать материал
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

            {materials.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Модулей пока нет.</p>
            ) : !isMaterialReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {materials.map(material => (
                        <Link
                            key={material.id}
                            href={route('material.show', {
                                organization: organization.id,
                                material: material.id,
                            })}
                            className="block"
                        >
                            <SortableMaterialCard
                                organization={organization}
                                material={material}
                                isReordering={false} />
                        </Link>
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
                                    lesson={lesson}
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
