import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Link} from "@inertiajs/react";

export default function ModuleCard({organization, module, isReordering }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: module.id });

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
            {...listeners}
            className={`glass-card p-6 hover:shadow-md transition-shadow flex flex-col justify-between ${
                isReordering ? 'cursor-grab active:cursor-grabbing' : ''
            } ${isDragging ? 'shadow-lg z-30' : ''}`}
        >
            <div>
                <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {module.title}
                </h3>
                <p
                    className="text-sm line-clamp-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {module.description || 'Описание отсутствует'}
                </p>
            </div>
            <div
                className="mt-4 pt-4 border-t flex items-center justify-between text-xs"
                style={{ borderColor: 'var(--color-border)' }}
            >
        <span style={{ color: 'var(--color-text-muted)' }}>
          Порядок: {module.order}
        </span>
                {!isReordering && (
                    <span
                        className="flex items-center gap-1"
                        style={{ color: 'var(--color-primary)' }}
                    >
            <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
              />
            </svg>
            Подробнее
          </span>
                )}
                {isReordering && (
                    <div
                        className="flex items-center gap-1"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                        Перетащите
                    </div>
                )}
            </div>
        </div>
    );

    // Оборачиваем в ссылку только если не режим перетаскивания
    if (!isReordering) {
        return (
            <Link
                href={route('module.show', {
                    organization: organization.id,
                    module: module.id,
                })}
                className="block"
            >
                {content}
            </Link>
        );
    }

    return content;
}
