import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback } from 'react';

export default function Index({ auth, organization, progresses, students, filters, availableTypes }) {
    const handleFilter = useCallback((newFilters) => {
        router.get(route('progress.check.index', { organization: organization.id }),
            { ...filters, ...newFilters },
            { preserveState: true, replace: true }
        );
    }, [filters, organization]);

    const clearFilters = () => {
        router.get(route('progress.check.index', { organization: organization.id }),
            {},
            { preserveState: true, replace: true }
        );
    };

    const typeLabels = {
        lesson_task: 'Задание урока',
        homework: 'Домашнее задание',
        exam: 'Контрольная работа',
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <Head title="Проверка прогресса" />
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Заголовок */}
                <div className="glass-card p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div
                            className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl"
                            style={{
                                background: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                            }}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-main">Проверка прогресса</h1>
                            <p className="text-meta mt-1">Выберите непроверенную работу, чтобы выставить оценку</p>
                        </div>
                    </div>
                </div>

                {/* Фильтры */}
                <div className="glass-card p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
                        <span style={{ color: 'var(--color-text-secondary)' }}>⚙</span>
                        Фильтры
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">Студент</label>
                            <select
                                className="form-input-glass"
                                value={filters.student_id || ''}
                                onChange={(e) => handleFilter({ student_id: e.target.value || undefined })}
                            >
                                <option value="">Все студенты</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">Тип задания</label>
                            <select
                                className="form-input-glass"
                                value={filters.type || ''}
                                onChange={(e) => handleFilter({ type: e.target.value || undefined })}
                            >
                                <option value="">Все типы</option>
                                {Object.entries(availableTypes).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">Дата с</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-meta text-sm">📅</span>
                                <input
                                    type="date"
                                    className="form-input-glass pl-10"
                                    value={filters.date_from || ''}
                                    onChange={(e) => handleFilter({ date_from: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">Дата по</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-meta text-sm">📅</span>
                                <input
                                    type="date"
                                    className="form-input-glass pl-10"
                                    value={filters.date_to || ''}
                                    onChange={(e) => handleFilter({ date_to: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    {Object.values(filters).some(v => v) && (
                        <button onClick={clearFilters} className="btn-ghost text-xs mt-5">
                            Сбросить фильтры
                        </button>
                    )}
                </div>

                {/* Список непроверенных работ */}
                <div className="glass-card p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-main mb-6 flex items-center gap-2">
                        <span style={{ color: 'var(--color-text-secondary)' }}>⏳</span>
                        Ожидают проверки
                    </h2>

                    {progresses.data.length === 0 ? (
                        <p className="text-meta text-center py-10">Нет непроверенных записей</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {progresses.data.map(p => {
                                const percent = p.max_points > 0 ? Math.round((p.points / p.max_points) * 100) : 0;
                                return (
                                    <div key={p.id} className="glass-card p-5 hover:shadow-md transition-shadow flex flex-col">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-main font-semibold text-sm line-clamp-2 truncate">{p.title}</h3>
                                                <span className="badge whitespace-nowrap ml-2">
                                                    {typeLabels[p.type] || p.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm mb-2">
                                                <span style={{ color: 'var(--color-text-secondary)' }}>👤</span>
                                                <span className="text-main font-medium truncate">{p.student_name}</span>
                                            </div>
                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-meta">Баллы</span>
                                                    <span className="text-main font-medium">
                                                        {`${p.points}/${p.max_points}`}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${percent}%`,
                                                            background: percent === 100
                                                                ? 'var(--color-success)'
                                                                : percent > 50
                                                                    ? 'var(--color-primary)'
                                                                    : 'var(--color-warning)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-meta">Попытка #{p.attempt}</span>
                                                <span className="inline-flex items-center gap-1 text-xs font-medium"
                                                      style={{ color: 'var(--color-warning)' }}>
                                                    <span>⏳</span>
                                                    Ожидает
                                                </span>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-1.5 text-xs text-meta">
                                                <span>📅</span>
                                                {p.created_at}
                                            </div>
                                        </div>
                                        <Link
                                            href={route('progress.check.show', { organization: organization.id, progress: p.id })}
                                            className="btn-primary text-sm w-full mt-4 justify-center"
                                        >
                                            Проверить
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Пагинация */}
                    {progresses.links && progresses.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex gap-2">
                                {progresses.links.map((link, idx) => {
                                    if (link.url === null) {
                                        return (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 text-xs text-meta bg-gray-100 dark:bg-gray-800 rounded-lg cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                link.active
                                                    ? 'text-white shadow-sm'
                                                    : 'glass-card text-main hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                            style={link.active ? { background: 'var(--color-primary)' } : {}}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
