import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import SortableQuestionCard from './SortableQuestionCard.jsx';
import CreateQuestionForm from "@/Pages/Console/Question/CreateQuestionForm.jsx";

const reorderRoutes = {
    task: 'question.task.reorder',
    homework: 'question.homework.reorder',
    exam: 'question.exam.reorder',
};

export default function SortableQuestions({
                                              questions = [],
                                              organizationId,
                                              parentType = 'task',
                                              parentId,
                                          }) {
    const [isReordering, setIsReordering] = useState(false);
    const [localQuestions, setLocalQuestions] = useState([]);
    const [isCreateQuestionModalOpen, setIsCreateQuestionModalOpen] = useState(false);
    const { organization } = usePage().props;
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const startReordering = () => {
        setLocalQuestions([...questions]);
        setIsReordering(true);
    };

    const cancelReordering = () => setIsReordering(false);

    const handleQuestionCreated = () => {
        setIsCreateQuestionModalOpen(false);
        router.reload({ only: [parentType], preserveScroll: true });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localQuestions.findIndex(q => q.id === active.id);
        const newIndex = localQuestions.findIndex(q => q.id === over.id);
        setLocalQuestions(arrayMove(localQuestions, oldIndex, newIndex));
    };

    const saveOrder = () => {
        const updatedItems = localQuestions.map((item, index) => ({
            id: item.id,
            order: index + 1,
        }));

        const routeName = reorderRoutes[parentType];
        if (!routeName) return;

        router.patch(
            route(routeName, {
                organization: organization.id,
                [parentType]: parentId,
            }),
            { items: updatedItems },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsReordering(false);
                    router.reload({ only: [parentType], preserveScroll: true });
                },
            }
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-main">Вопросы</h2>
                    <span className="badge">{questions.length || 0} шт.</span>
                </div>
                <div className="flex gap-2">
                    {!isReordering ? (
                        <>
                            <button
                                onClick={() => setIsCreateQuestionModalOpen(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                + Создать вопрос
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

            {questions.length === 0 ? (
                <div className="text-center py-8 text-meta">
                    <p>Вопросов пока нет. Создайте первый вопрос.</p>
                </div>
            ) : !isReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {questions.map(question => (
                        <SortableQuestionCard
                            key={question.id}
                            question={question}
                            organizationId={organizationId}
                            parentType={parentType}
                            parentId={parentId}
                            isReordering={false}
                        />
                    ))}
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={localQuestions.map(q => q.id)} strategy={rectSortingStrategy}>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {localQuestions.map(question => (
                                <SortableQuestionCard
                                    key={question.id}
                                    question={question}
                                    organizationId={organizationId}
                                    parentType={parentType}
                                    parentId={parentId}
                                    isReordering={true}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <CreateQuestionForm
                isOpen={isCreateQuestionModalOpen}
                onClose={() => setIsCreateQuestionModalOpen(false)}
                organization={organization}
                context={parentType}
                parentId={parentId}
                onSuccess={handleQuestionCreated}
            />
        </div>
    );
}
