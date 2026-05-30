import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link } from '@inertiajs/react';
import ConsoleCharts from "@/Pages/Console/ConsoleCharts.jsx";
import ProgressCharts from "@/Pages/Console/ProgressCharts.jsx";

const MetricCard = ({ label, value, href, color = 'primary' }) => {
    const colorMap = {
        indigo: {
            bg: 'rgba(99, 102, 241, 0.1)',
            border: 'rgba(99, 102, 241, 0.3)',
            text: '#6366F1',
        },
        emerald: {
            bg: 'rgba(16, 185, 129, 0.1)',
            border: 'rgba(16, 185, 129, 0.3)',
            text: '#10B981',
        },
        amber: {
            bg: 'rgba(245, 158, 11, 0.1)',
            border: 'rgba(245, 158, 11, 0.3)',
            text: '#D97706',
        },
        rose: {
            bg: 'rgba(244, 63, 94, 0.1)',
            border: 'rgba(244, 63, 94, 0.3)',
            text: '#E11D48',
        },
        cyan: {
            bg: 'rgba(6, 182, 212, 0.1)',
            border: 'rgba(6, 182, 212, 0.3)',
            text: '#0891B2',
        },
        violet: {
            bg: 'rgba(139, 92, 246, 0.1)',
            border: 'rgba(139, 92, 246, 0.3)',
            text: '#7C3AED',
        },
    };

    const colors = colorMap[color] || colorMap.indigo;

    const CardWrapper = href ? Link : 'div';

    return (
        <CardWrapper
            href={href}
            className="rounded-xl border p-4 flex flex-col gap-1 transition-all hover:shadow-md"
            style={{
                background: colors.bg,
                borderColor: colors.border,
                color: colors.text,
                cursor: href ? 'pointer' : 'default',
            }}
        >
            <span className="text-xs font-medium uppercase tracking-wide opacity-75">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
        </CardWrapper>
    );
};

export default function Index({ auth, organization, stats, uncheckedCount, topStudents,  progressStats }) {
    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                <h1 className="text-3xl font-bold text-main">
                    Консоль {organization.name}
                </h1>

                {/* Карточки основных метрик */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <MetricCard label="Студенты" value={stats.students} href={route('student.index', { organization: organization.id })} color="indigo" />
                    <MetricCard label="Группы" value={stats.groups} href={route('group.index', { organization: organization.id })} color="violet" />
                    <MetricCard label="Курсы" value={stats.courses} href={route('course.index', { organization: organization.id })} color="emerald" />
                    <MetricCard label="Модули" value={stats.modules} href={route('module.index', { organization: organization.id })} color="cyan" />
                    <MetricCard label="Уроки" value={stats.lessons} href={route('lesson.index', { organization: organization.id })} color="amber" />
                    <MetricCard label="Задания" value={stats.tasks} href={route('task.index', { organization: organization.id })} color="rose" />
                    <MetricCard label="ДЗ" value={stats.homeworks} href={route('homework.index', { organization: organization.id })} color="indigo" />
                    <MetricCard label="КР" value={stats.exams} href={route('exam.index', { organization: organization.id })} color="violet" />
                </div>

                <ProgressCharts progressStats={progressStats} />

                {/* Блок проверки */}
                <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-main">Проверка заданий</h2>
                        <p className="text-meta">
                            Непроверенных попыток: <span className="font-bold text-main">{uncheckedCount}</span>
                        </p>
                    </div>
                    {uncheckedCount > 0 && (
                        <Link
                            href={route('progress.check.index', { organization: organization.id })}
                            className="btn-primary"
                        >
                            Перейти к проверке
                        </Link>
                    )}
                </div>

                {/* Топ‑5 студентов */}
                {topStudents.length > 0 && (
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-main mb-4">Топ‑5 студентов</h2>
                        <div className="space-y-2">
                            {topStudents.map((student, index) => (
                                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-meta text-sm w-6">{index + 1}.</span>
                                        <Link
                                            href={route('student.show', { organization: organization.id, student: student.id })}
                                            className="text-main hover:underline truncate"
                                        >
                                            {student.lastname} {student.firstname}
                                        </Link>
                                    </div>
                                    <div
                                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap"
                                        style={{
                                            background: 'var(--color-accent-amber-light)',
                                            color: 'var(--color-accent-amber)',
                                        }}
                                    >
                                        <span>★</span>
                                        {student.score}
                                    </div>
                                </div>
                            ))}
                        </div>
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
