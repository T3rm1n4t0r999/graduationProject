import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@inertiajs/react";

export default function SortableLessonCard({ organization, lesson, isReordering = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lesson.id });

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
            <h3 className="text-lg font-semibold text-main flex items-center gap-2 truncate">
                {lesson.title}
                <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                        background: lesson.is_active
                            ? 'var(--color-success)'
                            : 'var(--color-text-muted)',
                    }}
                    title={lesson.is_active ? 'Активен' : 'Неактивен'}
                />
            </h3>

            <p className="text-sm line-clamp-2 text-meta">
                {lesson.description || 'Описание отсутствует'}
            </p>

            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-xs">
                <span className="text-label">Порядок: {lesson.order}</span>
                <span className="text-label">
                    Материалы: {lesson.materials_count ?? lesson.materials?.length ?? 0}
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
                href={route("lesson.show", {
                    organization: organization.id,
                    lesson: lesson.id,
                })}
                className="block"
            >
                {content}
            </Link>
        );
    }

    return content;
}
