import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@inertiajs/react";

export default function SortableMaterialCard({ organization, material, isReordering }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: material.id });

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
                {material.title}
                <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                        background: material.is_active
                            ? 'var(--color-success)'
                            : 'var(--color-text-muted)',
                    }}
                    title={material.is_active ? 'Активно' : 'Неактивно'}
                />
            </h3>

            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-xs">
                <span className="text-label">Порядок: {material.order}</span>

                <span className={`flex items-center gap-1 ${
                    material.is_active ? "text-success" : "text-label"
                }`}>
                    <span
                        className={`inline-block w-2 h-2 rounded-full ${
                            material.is_active ? "bg-green-500" : "bg-gray-400"
                        }`}
                    />
                    {material.is_active ? "Активно" : "Неактивно"}
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
                href={route("material.show", {
                    organization: organization.id,
                    material: material.id,
                })}
                className="block"
            >
                {content}
            </Link>
        );
    }

    return content;
}
