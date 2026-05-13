// resources/js/Pages/Console/Course/SortableCourseCard.jsx
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
        opacity: isDragging ? 0.7 : 1,
    };
    // Всё содержимое карточки
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
            <h3
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: "var(--color-text-primary)" }}
            >
                {course.title}
                <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                        course.is_active ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                    title={course.is_active ? 'Активен' : 'Неактивен'}
                />
            </h3>

            <p
                className="text-sm line-clamp-2"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                {course.description || 'Описание отсутствует'}
            </p>

            {/* Футер с информацией */}
            <div className="mt-auto pt-3 border-t flex items-center justify-between text-xs flex-wrap gap-2"
                 style={{ borderColor: "var(--color-border)" }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    Порядок: {course.order}
                 </span>
                <span style={{ color: "var(--color-text-muted)" }}>
                    Модули: {course.modules_count ?? 0}
                </span>


                {!isReordering && (
                    <span className="flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        Подробнее
                    </span>
                )}

                {isReordering && (
                    <div className="flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                        Перетащите
                    </div>
                )}
            </div>
        </div>
    );

    // Если не режим перетаскивания – оборачиваем в ссылку на курс
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

    // В режиме перетаскивания возвращаем просто div
    return content;
}
