import ConsoleLayout from '@/Layouts/ConsoleLayout.jsx';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback } from 'react';

export default function Index({ auth, organization, student, progresses, filters, availableTypes }) {
    const handleFilter = useCallback(
        (newFilters) => {
            router.get(route('student.progress.index', {
                organization: organization.id,
                student: student.id,
            }), { ...filters, ...newFilters }, { preserveState: true, replace: true });
        },
        [filters, organization, student]
    );

    const clearFilters = () => {
        router.get(route('student.progress.index', {
            organization: organization.id,
            student: student.id,
        }), {}, { preserveState: true, replace: true });
    };

    const typeLabels = {
        lesson_task: 'Задание урока',
        homework: 'Домашнее задание',
        exam: 'Контрольная работа',
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <Head title={`Прогресс ${student.lastname} ${student.firstname}`} />

            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Заголовок */}
                <div className="glass-card p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div
                                className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl"
                                style={{
                                    background: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)',
                                }}
                            >
                                <span className="text-2xl">📊</span>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main">
                                    Прогресс: {student.lastname} {student.firstname}
                                </h1>
                                <p className="text-meta mt-1 flex flex-wrap items-center gap-2">
                                    <span>@{student.username}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Telegram ID: {student.telegram_id}</span>
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('student.show', { organization: organization.id, student: student.id })}
                            className="btn-ghost text-sm self-start"
                        >
                            ← Назад к студенту
                        </Link>
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
                            <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">Тип задания</label>
                            <select
                                className="form-input-glass"
                                value={filters.type || ''}
                                onChange={(e) => handleFilter({ type: e.target.value })}
                            >
                                <option value="">Все типы</option>
                                {Object.entries(availableTypes).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">Проверено</label>
                            <select
                                className="form-input-glass"
                                value={filters.checked ?? ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    handleFilter({ checked: val === '' ? undefined : val === '1' });
                                }}
                            >
                                <option value="">Все</option>
                                <option value="1">Проверенные</option>
                                <option value="0">Не проверенные</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-meta mb-1 uppercase tracking-wide">Дата с</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-meta">📅</span>
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
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-meta">📅</span>
                                <input
                                    type="date"
                                    className="form-input-glass pl-10"
                                    value={filters.date_to || ''}
                                    onChange={(e) => handleFilter({ date_to: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    {Object.values(filters).some(v => v !== null && v !== '' && v !== undefined) && (
                        <button onClick={clearFilters} className="btn-ghost text-xs mt-5">
                            Сбросить фильтры
                        </button>
                    )}
                </div>

                {/* Записи прогресса */}
                <div className="glass-card p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-main mb-6 flex items-center gap-2">
                        <span style={{ color: 'var(--color-text-secondary)' }}>📋</span>
                        Записи прогресса
                    </h2>

                    {progresses.data.length === 0 ? (
                        <p className="text-meta text-center py-10">Прогресс не найден</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {progresses.data.map((p) => {
                                const percent = p.max_points > 0 ? Math.round((p.points / p.max_points) * 100) : 0;
                                return (
                                    <Link
                                        key={p.id}
                                        href={route('student.progress.show', {
                                            organization: organization.id,
                                            student: student.id,
                                            progress: p.id,
                                        })}
                                        className="block group"
                                    >
                                        <div className="glass-card p-5 h-full transition-all duration-200 hover:shadow-md border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-main font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                                                    {p.title}
                                                </h3>
                                                <span className="badge whitespace-nowrap ml-2">
                                                    {typeLabels[p.progressable_type] || p.progressable_type}
                                                </span>
                                            </div>
                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-meta">Баллы</span>
                                                    <span className="text-main font-medium">{p.points}/{p.max_points}</span>
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
                                                                    : 'var(--color-warning)',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-meta">Попытка #{p.attempt}</span>
                                                {p.checked ? (
                                                    <span
                                                        className="inline-flex items-center gap-1 text-xs font-medium"
                                                        style={{ color: 'var(--color-success)' }}
                                                    >
                                                        ✓ Проверено
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center gap-1 text-xs font-medium"
                                                        style={{ color: 'var(--color-warning)' }}
                                                    >
                                                        ⏳ Ожидает
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-1.5 text-xs text-meta">
                                                <span>📅</span>
                                                {p.created_at}
                                            </div>
                                        </div>
                                    </Link>
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
