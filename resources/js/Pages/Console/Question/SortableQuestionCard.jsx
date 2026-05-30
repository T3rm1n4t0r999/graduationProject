import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@inertiajs/react";
import TextLimiter from "@/Components/TextLimiter.jsx";

const parentRouteParams = {
    task: { routeName: 'task.show', param: 'task' },
    homework: { routeName: 'homework.show', param: 'homework' },
    exam: { routeName: 'exam.show', param: 'exam' },
};

export default function SortableQuestionCard({
                                                 organizationId,
                                                 parentType = 'task',
                                                 parentId,
                                                 question,
                                                 isReordering = false
                                             }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
    };

    const getTypeLabel = (type) => {
        const labels = {
            single_choice: 'Один вариант',
            multiple_choice: 'Несколько вариантов',
            text: 'Текстовый ответ',
            free_text: 'Свободный ответ',
        };
        return labels[type] || type;
    };

    const content = (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(isReordering ? listeners : {})}
            className={`glass-card p-4 flex flex-col gap-2 ${
                isReordering ? "cursor-grab active:cursor-grabbing" : ""
            } ${isDragging ? "shadow-lg z-30" : ""}`}
        >
            <h3 className="text-lg font-semibold text-main flex items-center gap-2 truncate">
                <TextLimiter text={question.question} maxLength={10} />
                {question.is_active !== undefined && (
                    <span
                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                            background: question.is_active
                                ? 'var(--color-success)'
                                : 'var(--color-text-muted)',
                        }}
                        title={question.is_active ? 'Активен' : 'Неактивен'}
                    />
                )}
            </h3>

            {question.content && (
                <p className="text-sm line-clamp-2 text-meta">{question.content}</p>
            )}

            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-xs">
                <span className="text-label">Порядок: {question.order}</span>

                {question.question_type && (
                    <span className="badge text-xs">{getTypeLabel(question.question_type)}</span>
                )}

                {question.points !== undefined && (
                    <span className="text-label">
                        Баллы: <span className="font-semibold text-main">{question.points}</span>
                    </span>
                )}

                {question.is_active !== undefined && (
                    <span className={`flex items-center gap-1 ${question.is_active ? 'text-success' : 'text-label'}`}>
                        <span
                            className={`inline-block w-2 h-2 rounded-full ${
                                question.is_active ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                        />
                        {question.is_active ? 'Активно' : 'Неактивно'}
                    </span>
                )}

                {!isReordering ? (
                    <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                        Подробнее →
                    </span>
                ) : (
                    <span className="text-label">≡ Перетащите</span>
                )}
            </div>
        </div>
    );

    if (!isReordering) {
        return (
            <Link
                href={route("question.show", {
                    organization: organizationId,
                    question: question.id,
                })}
                className="block"
            >
                {content}
            </Link>
        );
    }

    return content;
}
