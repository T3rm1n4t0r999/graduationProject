import { Link } from "@inertiajs/react";

export default function ModuleCard({ module, organization }) {
    return (
        <Link
            href={route('module.show', {
                organization: organization.id,
                module: module.id,
            })}
            className="glass-card p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col group"
        >
            <div className="min-w-0">
                <h3 className="text-base font-semibold text-main truncate flex items-center gap-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {module.title}
                    <span
                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                            background: module.is_active
                                ? 'var(--color-success)'
                                : 'var(--color-text-muted)',
                        }}
                        title={module.is_active ? 'Активен' : 'Неактивен'}
                    />
                </h3>
                <p className="text-sm text-meta mt-0.5 line-clamp-2">
                    {module.description || 'Описание отсутствует'}
                </p>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-xs">
                <span className="text-label">Порядок: {module.order}</span>
                <span className="text-label">Уроки: {module.lessons_count ?? 0}</span>
                <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                    Подробнее →
                </span>
            </div>
        </Link>
    );
}
