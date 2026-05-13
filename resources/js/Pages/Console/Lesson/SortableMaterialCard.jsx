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

    // Контент карточки
    const content = (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`glass-card p-6 hover:shadow-md transition-shadow flex flex-col ${
                isReordering ? "cursor-grab active:cursor-grabbing" : ""
            } ${isDragging ? "shadow-lg z-30" : ""}`}
        >
            <div className="flex-1">
                <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {material.title}
                </h3>

            </div>

            {/* Футер с информацией: порядок, баллы, статус */}
            <div
                className="mt-auto pt-4 border-t flex items-center justify-between text-xs flex-wrap gap-2"
                style={{ borderColor: "var(--color-border)" }}
            >
        <span style={{ color: "var(--color-text-muted)" }}>
          Порядок: {material.order}
        </span>
            {/* Статус активности */}
            <span className="flex items-center gap-1.5">
              <span
                  className={`w-2 h-2 rounded-full ${
                      material.is_active ? "bg-green-500" : "bg-gray-400"
                  }`}
              />
              <span style={{ color: "var(--color-text-muted)" }}>
                {material.is_active ? "Активно" : "Неактивно"}
              </span>
        </span>

                {!isReordering && (
                    <span
                        className="flex items-center gap-1"
                        style={{ color: "var(--color-primary)" }}
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
                        style={{ color: "var(--color-text-muted)" }}
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


    return content;
}
