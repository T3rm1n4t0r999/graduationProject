import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import CreateGroupForm from "@/Pages/Console/Group/CreateGroupForm.jsx";

function GroupCard({ group, organizationId }) {
    return (
        <Link
            href={route('group.show', { organization: organizationId, group: group.id })}
            className="glass-card p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col group"
        >
            <div className="flex items-start gap-3 mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                        background: 'var(--color-accent-emerald-light)',
                        color: 'var(--color-accent-emerald)',
                    }}
                >
                    <span role="img" aria-label="группа">👥</span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-main truncate">
                        {group.name}
                    </h3>
                    <p className="text-sm text-meta mt-0.5 line-clamp-2">
                        {group.description || 'Нет описания'}
                    </p>
                </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-main">{group.students_count ?? 0}</span>
                        <span className="text-xs text-meta">Студентов</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-main truncate max-w-[80px]">{group.specialty || '—'}</span>
                        <span className="text-xs text-meta">Спец.</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function List({ auth, organization, groups }) {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const handleGroupCreated = () => {
        setCreateModalOpen(false);
        router.reload({ only: ['groups'] });
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Заголовок */}
                <div className="glass-card p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl"
                                style={{
                                    background: 'var(--color-accent-emerald-light)',
                                    color: 'var(--color-accent-emerald)',
                                }}
                            >
                                <span role="img" aria-label="группы" className="text-2xl">👥</span>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main">Группы</h1>
                                <p className="text-meta mt-1">
                                    Всего групп: <span className="font-semibold text-main">{groups.total ?? groups.data.length}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setCreateModalOpen(true)} className="btn-primary flex items-center gap-2">
                            + Создать группу
                        </button>
                    </div>
                </div>

                {/* Сетка групп */}
                {groups.data.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-4xl" style={{ color: 'var(--color-text-muted)' }}>👥</span>
                            <p className="text-meta">Нет групп</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {groups.data.map(group => <GroupCard key={group.id} group={group} organizationId={organization.id} />)}
                    </div>
                )}
            </div>
            <CreateGroupForm
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                organization={organization}
                onSuccess={handleGroupCreated}
            />
        </ConsoleLayout>
    );
}
