import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@inertiajs/react";

export default function SortableTaskCard({ organization, task, isReordering }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
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
            <h3 className="text-lg font-semibold text-main truncate flex items-center gap-2">
                {task.title}
                <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                        background: task.is_active
                            ? 'var(--color-success)'
                            : 'var(--color-text-muted)',
                    }}
                    title={task.is_active ? 'Активно' : 'Неактивно'}
                />
            </h3>


            <p className="text-sm line-clamp-2 text-meta">
                {task.description ? task.description : 'Описание отсутствует'}
            </p>


            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-xs">
                <span className="text-label">Порядок: {task.order}</span>
                <span className="text-label">Баллы: {task.max_score ?? 0}</span>

                <span className={`flex items-center gap-1 ${
                    task.is_active ? "text-success" : "text-label"
                }`}>
                    <span
                        className={`inline-block w-2 h-2 rounded-full ${
                            task.is_active ? "bg-green-500" : "bg-gray-400"
                        }`}
                    />
                    {task.is_active ? "Активно" : "Неактивно"}
                </span>

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
                href={route("task.show", {
                    organization: organization.id,
                    task: task.id,
                })}
                className="block"
            >
                {content}
            </Link>
        );
    }

    return content;
}
