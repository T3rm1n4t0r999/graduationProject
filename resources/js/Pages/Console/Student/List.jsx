import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link } from '@inertiajs/react';

function StudentCard({ student, organizationId }) {
    const initials = `${student.lastname?.[0] || ''}${student.firstname?.[0] || ''}`.toUpperCase();
    const groups = student.groups || [];

    return (
        <Link
            href={route('student.show', { organization: organizationId, student: student.id })}
            className="glass-card p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col group"
        >
            <div className="flex items-start gap-3 mb-4">
                {/* Аватар */}
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-main group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {student.lastname} {student.firstname}
                    </h3>
                    <p className="text-sm text-meta mt-0.5 truncate">@{student.username}</p>
                </div>

                {/* Баллы */}
                <div
                    className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap"
                    style={{
                        background: 'var(--color-accent-amber-light)',
                        color: 'var(--color-accent-amber)',
                    }}
                >
                    <span>⭐</span>
                    {student.score}
                </div>
            </div>

            {/* Группы */}
            {groups.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {groups.map(group => (
                        <span
                            key={group.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                            style={{
                                background: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                                borderColor: 'var(--color-primary)',
                            }}
                        >
                            <span className="mr-1">👥</span>
                            {group.name}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                {/* Статистика */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-main">{student.courses_count ?? 0}</span>
                        <span className="text-xs text-meta flex items-center gap-1">
                            <span>📘</span>
                            Курсы
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-main">{student.homeworks_count ?? 0}</span>
                        <span className="text-xs text-meta flex items-center gap-1">
                            <span>📝</span>
                            ДЗ
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-main">{student.exams_count ?? 0}</span>
                        <span className="text-xs text-meta flex items-center gap-1">
                            <span>✅</span>
                            КР
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function List({ auth, organization, students }) {
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
                                    background: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)',
                                }}
                            >
                                <span className="text-2xl">👥</span>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main">Студенты</h1>
                                <p className="text-meta mt-1">
                                    Всего студентов: <span className="font-semibold text-main">{students.total}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Сетка студентов */}
                {students.data.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-4xl" style={{ color: 'var(--color-text-muted)' }}>👥</span>
                            <p className="text-meta">Нет студентов в организации.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {students.data.map(student => (
                            <StudentCard key={student.id} student={student} organizationId={organization.id} />
                        ))}
                    </div>
                )}
            </div>
        </ConsoleLayout>
    );
}
