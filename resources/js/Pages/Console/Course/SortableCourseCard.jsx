import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@inertiajs/react";

export default function SortableCourseCard({ course, organization, isReordering }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: course.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const content = (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`glass-card p-4 flex flex-col gap-2 ${
                isReordering ? "cursor-grab active:cursor-grabbing" : ""
            } ${isDragging ? "shadow-lg z-30" : ""}`}
        >
            <h3 className="text-lg font-semibold text-main flex items-center gap-2 truncate">
                {course.title}
                <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                        background: course.is_active
                            ? 'var(--color-success)'
                            : 'var(--color-text-muted)',
                    }}
                    title={course.is_active ? 'Активен' : 'Неактивен'}
                />
            </h3>

            <p className="text-sm line-clamp-2 text-meta">
                {course.description ? course.description : 'Описание отсутствует'}
            </p>

            {/* Футер */}
            <div className="mt-auto pt-3 border-t flex items-center justify-between text-xs flex-wrap gap-2"
                 style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-label">Порядок: {course.order}</span>
                <span className="text-label">Модули: {course.modules_count ?? 0}</span>

                {!isReordering && (
                    <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                        Подробнее →
                    </span>
                )}

                {isReordering && (
                    <span className="text-label">
                        ≡ Перетащите
                    </span>
                )}
            </div>
        </div>
    );

    if (!isReordering) {
        return (
            <Link
                href={route("course.show", {
                    organization: organization.slug ?? organization.id,
                    course: course.id,
                })}
                className="block"
            >
                {content}
            </Link>
        );
    }

    return content;
}
