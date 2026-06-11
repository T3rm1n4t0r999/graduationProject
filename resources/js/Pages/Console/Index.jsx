import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link } from '@inertiajs/react';
import ProgressCharts from "@/Pages/Console/ProgressCharts.jsx";
import { TrendingUp, TrendingDown, CheckCircle, Clock } from 'lucide-react'; // иконки (npm install lucide-react)

// Карточка метрики с трендом
const MetricCard = ({ label, value, href, color = 'primary', trend, icon: Icon }) => {
    const colorMap = {
        indigo: { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.3)', text: '#6366F1' },
        emerald: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10B981' },
        amber: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#D97706' },
        rose: { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.3)', text: '#E11D48' },
        cyan: { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)', text: '#0891B2' },
        violet: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', text: '#7C3AED' },
    };
    const colors = colorMap[color] || colorMap.indigo;

    return (
        <Link href={href || '#'} className="glass-card p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-300 group">
            <div className="flex justify-between items-start">
                <span className="text-xs font-medium uppercase tracking-wide opacity-70 text-meta">{label}</span>
            </div>
            <div className="flex items-end justify-between text-meta">
                <span className="text-3xl font-bold" style={{ color: colors.text }}>{value}</span>
                {trend && (
                    <span className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </Link>
    );
};

// Карточка с двумя значениями (например, средний балл)
const StatCard = ({ title, value, subtitle, progress, color = 'primary' }) => {
    const colorMap = {
        primary: { bar: 'var(--color-primary)', text: 'var(--color-primary)' },
        success: { bar: 'var(--color-success)', text: 'var(--color-success)' },
        warning: { bar: 'var(--color-warning)', text: 'var(--color-warning)' },
    };
    const clr = colorMap[color] || colorMap.primary;
    return (
        <div className="glass-card p-5 space-y-3">
            <span className="text-xs font-medium uppercase tracking-wide text-meta">{title}</span>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-main">{value}</span>
                {subtitle && <span className="text-sm text-meta">{subtitle}</span>}
            </div>
            {progress !== undefined && (
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: clr.bar }} />
                </div>
            )}
        </div>
    );
};

export default function Index({ auth, organization, stats, uncheckedCount, topStudents, progressStats, trends, dailyAttempts, activeStudents, checkedPercent, questionsAwaitingCheck }) {
    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold text-main">Консоль {organization.name}</h1>
                    <div className="flex gap-3">
                        <Link href={route('progress.check.index', { organization: organization.id })} className="btn-primary">
                            Проверка заданий
                        </Link>
                    </div>
                </div>

                {/* Карточки метрик с трендами */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <MetricCard label="Студенты" value={stats.students} href={route('student.index', { organization: organization.id })} color="indigo" trend={trends?.new_students} />
                    <MetricCard label="Группы" value={stats.groups} href={route('group.index', { organization: organization.id })} color="violet" />
                    <MetricCard label="Курсы" value={stats.courses} href={route('course.index', { organization: organization.id })} color="emerald" />
                    <MetricCard label="Модули" value={stats.modules} href={route('module.index', { organization: organization.id })} color="cyan" />
                    <MetricCard label="Уроки" value={stats.lessons} href={route('lesson.index', { organization: organization.id })} color="amber" />
                    <MetricCard label="Задания" value={stats.tasks} href={route('task.index', { organization: organization.id })} color="rose" />
                    <MetricCard label="Д/З" value={stats.homeworks} href={route('homework.index', { organization: organization.id })} color="indigo" />
                    <MetricCard label="Контрольные" value={stats.exams} href={route('exam.index', { organization: organization.id })} color="violet" />
                    <MetricCard label="Непроверено" value={uncheckedCount} href={route('progress.check.index', { organization: organization.id })} color="rose" icon={Clock} />
                </div>

                {/* Ключевые показатели */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Средний балл" value={progressStats.avgPoints} subtitle="за все попытки" progress={progressStats.avgPoints} color="primary" />
                    <StatCard title="Проверено" value={progressStats.checkedCount} subtitle={`${checkedPercent}% от всех`} progress={checkedPercent} color="success" />
                    <StatCard title="Активные студенты (7 дн.)" value={activeStudents?.length || 0} subtitle="совершили попытки" />
                    <StatCard title="Требуют проверки" value={questionsAwaitingCheck || 0} subtitle="свободные ответы / файлы" color="warning" />
                </div>

                {/* Графики активности и прогресса */}
                <ProgressCharts progressStats={progressStats} dailyAttempts={dailyAttempts} activeStudents={activeStudents} />

                {/* Топ активных студентов и топ по баллам */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Топ активных за 7 дней */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Самые активные за неделю
                        </h2>
                        {activeStudents?.length > 0 ? (
                            <ul className="space-y-3">
                                {activeStudents.map((s, i) => (
                                    <li key={s.id} className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-meta text-sm w-5">{i + 1}.</span>
                                            <Link href={route('student.show', { organization: organization.id, student: s.id })} className="text-main hover:underline truncate">{s.name}</Link>
                                        </div>
                                        <span className="text-sm font-medium text-meta">{s.attempts} попыток</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-meta text-sm">Нет данных за последние 7 дней</p>
                        )}
                    </div>

                    {/* Топ по баллам */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            Топ по баллам
                        </h2>
                        {topStudents.length > 0 ? (
                            <ul className="space-y-3">
                                {topStudents.map((s, i) => (
                                    <li key={s.id} className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-meta text-sm w-5">{i + 1}.</span>
                                            <Link href={route('student.show', { organization: organization.id, student: s.id })} className="text-main hover:underline truncate">{s.lastname} {s.firstname}</Link>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                            {s.score} балл.
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-meta text-sm">Нет данных</p>
                        )}
                    </div>
                </div>
            </div>
        </ConsoleLayout>
    );
}
