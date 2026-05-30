import {Link} from "@inertiajs/react";

export default function MaterialCard({ material, organization }) {
    return (
        <Link
            href={route('material.show', {
                organization: organization.id,
                material: material.id,
            })}
            className="glass-card p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col group"
        >
            <h3 className="text-base font-semibold text-main truncate flex items-center gap-2">
                {material.title}
                <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                        background: material.is_active
                            ? 'var(--color-success)'
                            : 'var(--color-text-muted)',
                    }}
                    title={material.is_active ? 'Активен' : 'Неактивен'}
                />
            </h3>
            <div className="mt-auto pt-4 flex items-center justify-end text-xs">
                <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                    Подробнее →
                </span>
            </div>
        </Link>
    );
}
