import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import CreateModuleForm from "@/Pages/Console/Module/CreateModuleForm.jsx";
import SortableModuleCard from "@/Pages/Console/Module/SortableModuleCard.jsx";

export default function SortableModules({ modules }) {
    const [isReordering, setIsReordering] = useState(false);
    const [localModules, setLocalModules] = useState([]);
    const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
    const { organization, course } = usePage().props;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const startReordering = () => {
        setLocalModules([...modules]);
        setIsReordering(true);
    };

    const cancelReordering = () => {
        setIsReordering(false);
    };

    const handleModuleCreated = () => {
        setIsCreateModuleModalOpen(false);
        router.reload({ only: ['modules'], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localModules.findIndex(m => m.id === active.id);
        const newIndex = localModules.findIndex(m => m.id === over.id);
        setLocalModules(arrayMove(localModules, oldIndex, newIndex));
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
                    router.reload({ only: ['course'], preserveScroll: true });
                },
            }
        );
    };

    return (
        <div>
            {/* Заголовок и кнопки управления */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-main">Модули</h2>
                    <span className="badge">{modules.length || 0} шт.</span>
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
                            <button onClick={startReordering} className="btn-ghost text-sm">
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

            {/* Список модулей */}
            {modules.length === 0 ? (
                <p className="text-meta text-center py-8">Модулей пока нет.</p>
            ) : !isReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {modules.map(module => (
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
