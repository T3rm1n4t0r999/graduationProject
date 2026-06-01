import { useState, useEffect, useRef } from 'react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedQuestionId, setHighlightedQuestionId] = useState(null);

    const { organization } = usePage().props;
    const searchInputRef = useRef(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
        setLocalQuestions([...questions]);
        setSearchQuery('');
        setHighlightedQuestionId(null);
        setIsReordering(true);
    };

    const cancelReordering = () => {
        setIsReordering(false);
        setLocalQuestions([]);
        setSearchQuery('');
        setHighlightedQuestionId(null);
    };

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

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (!query.trim()) {
            setHighlightedQuestionId(null);
            return;
        }

        const search = query.toLowerCase();
        const found = localQuestions.find(q =>
            q.question.toLowerCase().includes(search)
        );

        if (found) {
            setHighlightedQuestionId(found.id);
            setTimeout(() => {
                document.getElementById(`question-${found.id}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        } else {
            setHighlightedQuestionId(null);
        }
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
                    setLocalQuestions([]);
                    router.reload({ only: [parentType], preserveScroll: true });
                },
            }
        );
    };

    const displayQuestions = isReordering ? localQuestions : questions;

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
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
                            {questions.length > 1 && (
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
            {isReordering && (
                <div className="mb-4 space-y-3">
                    <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--color-accent-amber-light)', color: 'var(--color-accent-amber)' }}>
                        💡 Перетащите карточки для изменения порядка вопросов.
                    </div>
                    {localQuestions.length > 5 && (
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="🔍 Найти вопрос для перемещения..."
                                className="form-input-glass w-full pl-10 pr-4 py-2.5"
                            />
                            {searchQuery && !highlightedQuestionId && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-meta">Не найдено</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {displayQuestions.length === 0 ? (
                <div className="text-center py-8 text-meta">
                    <p>Вопросов пока нет. Создайте первый вопрос.</p>
                    {!isReordering && (
                        <button
                            onClick={() => setIsCreateQuestionModalOpen(true)}
                            className="btn-primary mt-4"
                        >
                            + Создать вопрос
                        </button>
                    )}
                </div>
            ) : !isReordering ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayQuestions.map(question => (
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
                                    isHighlighted={highlightedQuestionId === question.id}
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
