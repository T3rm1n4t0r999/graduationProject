import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CreateModuleForm from '@/Pages/Console/Module/CreateModuleForm';

function ModuleCard({ module, organizationId }) {
    return (
        <Link
            href={route('module.show', {
                organization: organizationId,
                module: module.id,
            })}
            className="glass-card p-6 hover:shadow-md transition-shadow flex flex-col justify-between group"
        >
            <div>
                <h3
                    className="text-lg font-semibold mb-2 group-hover:underline"
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
                <span style={{ color: 'var(--color-text-muted)' }}>
                Уроки: {module?.lessons?.length ? module?.lessons?.length : '0'}
                </span>
                <span className="flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    Подробнее
                </span>
            </div>
        </Link>
    );
}

export default function List({ auth, organization, modules, courses }) {
    const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);

    const handleModuleCreated = () => {
        setIsCreateModuleModalOpen(false);
        router.reload({ only: ['modules'], preserveScroll: true });
    };

    return (
        <ConsoleLayout
            auth={auth}
            organization={organization}
            header={
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Модули
                </h1>
            }
        >
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <button onClick={() => setIsCreateModuleModalOpen(true)} className="btn-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Создать модуль
                    </button>
                </div>

                {modules.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                            Пока нет ни одного модуля.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {modules.data.map((module) => (
                            <ModuleCard key={module.id} module={module} organizationId={organization.id} />
                        ))}
                    </div>
                )}
            </div>

            <CreateModuleForm
                isOpen={isCreateModuleModalOpen}
                onClose={() => setIsCreateModuleModalOpen(false)}
                organization={organization}
                courses={courses.data}
                onSuccess={handleModuleCreated}
            />
        </ConsoleLayout>
    );
}
