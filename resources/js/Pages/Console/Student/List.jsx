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

                <div
                    className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap"
                    style={{
                        background: 'var(--color-accent-amber-light)',
                        color: 'var(--color-accent-amber)',
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    {student.score}
                </div>
            </div>


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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                                <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                            </svg>
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
                            {/* Замена 📘 на SVG книги */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3.75a9.753 9.753 0 0 0-3.25.555V21a9.753 9.753 0 0 0 3.25-.555 9.707 9.707 0 0 0 5.25-.778V4.533ZM12.75 20.672A9.707 9.707 0 0 0 18 21.75a9.753 9.753 0 0 0 3.25-.555V4.305a9.753 9.753 0 0 0-3.25-.555 9.707 9.707 0 0 0-5.25.778v16.144Z" />
                            </svg>
                            Курсы
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-main">{student.homeworks_count ?? 0}</span>
                        <span className="text-xs text-meta flex items-center gap-1">
                            {/* Замена 📝 на SVG карандаша/листа */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-4.72 4.72a.75.75 0 1 1-1.06-1.06l4.72-4.72h-2.69a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 5.25V4.5Z" clipRule="evenodd" />
                            </svg>
                            ДЗ
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-main">{student.exams_count ?? 0}</span>
                        <span className="text-xs text-meta flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                            </svg>
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
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                                </svg>
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
