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
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                    </svg>
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
                                    background: 'var(--color-accent-amber-light)',
                                    color: 'var(--color-accent-amber)',
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                                </svg>
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
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }

            `}</style>
        </ConsoleLayout>
    );
}
