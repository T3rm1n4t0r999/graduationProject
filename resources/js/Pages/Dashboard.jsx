import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import ErrorBoundary from "@/Components/ErrorBoundary.jsx";

export default function Dashboard({
                                      auth,
                                      organizations,
                                      selectedOrgId,
                                      selectedOrg,
                                      overviewStats,
                                      totalOverview,
                                      stats,
                                      activity,
                                      studentData,
                                  }) {
    const userRole = selectedOrg?.pivot?.role;
    const isAdmin = ['owner', 'manager', 'admin'].includes(userRole);
    const isStudent = userRole === 'student';

    // Переключение организации через URL (с partial reload)
    const switchOrganization = (orgId) => {
        router.get(
            route('dashboard'),
            { org: orgId },
            { preserveState: true, preserveScroll: true, only: ['selectedOrgId', 'selectedOrg', 'stats', 'activity', 'studentData'] }
        );
    };

    const pendingChecks = stats?.pendingChecks || 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-xl font-semibold text-main">
                        👋 Привет, {auth.user.name}!
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-meta">
                            <span>🏢</span>
                            <span><strong className="text-main">{totalOverview.organizations_count}</strong> организ.</span>
                        </div>
                        <div className="flex items-center gap-2 text-meta">
                            <span>👥</span>
                            <span><strong className="text-main">{totalOverview.total_students}</strong> студентов</span>
                        </div>
                        {pendingChecks > 0 && isAdmin && (
                            <Link
                                href={route('progress.check.index', selectedOrgId)}
                                className="btn-primary text-sm flex items-center gap-2"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                Непроверенных: {pendingChecks}
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* === СЕЛЕКТОР ОРГАНИЗАЦИЙ (Overview карточки) === */}
                    {organizations.length > 0 && (
                        <OrganizationsOverview
                            organizations={organizations}
                            overviewStats={overviewStats}
                            selectedOrgId={selectedOrgId}
                            onSelect={switchOrganization}
                        />
                    )}

                    {/* === Детальный дашборд для выбранной организации === */}
                    {selectedOrg && (
                        <div className="space-y-6 animate-fade-in" key={selectedOrgId}>
                            {/* Статистика для админов */}
                            {isAdmin && stats && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard
                                            title="Всего студентов"
                                            value={stats.totalStudents}
                                            icon="users"
                                            trend={stats.studentsGrowth}
                                            subtitle={`+${stats.studentsLastWeek} за неделю`}
                                        />
                                        <StatCard
                                            title="Активных"
                                            value={stats.activeStudents}
                                            icon="user-active"
                                            subtitle="за последний месяц"
                                        />
                                        <StatCard
                                            title="Проверено работ"
                                            value={stats.completedProgress}
                                            icon="check-circle"
                                        />
                                        <StatCard
                                            title="Средний балл"
                                            value={stats.averageScore}
                                            icon="chart-bar"
                                            subtitle="по организации"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <QuickActions org={selectedOrg} stats={stats} />
                                        <ErrorBoundary>
                                            <TopStudents students={stats.topStudents || [] || console.log(stats.topStudents)} />
                                        </ErrorBoundary>
                                    </div>
                                    <ErrorBoundary>
                                        <ActivityFeed activity={activity} />
                                    </ErrorBoundary>
                                </>
                            )}

                            {/* Студенческий дашборд */}
                            {isStudent && studentData && (
                                <StudentDashboard studentData={studentData} org={selectedOrg} />
                            )}
                        </div>
                    )}

                    {/* Нет организаций */}
                    {organizations.length === 0 && <EmptyState />}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// === КОМПОНЕНТЫ ===

function OrganizationsOverview({ organizations, overviewStats, selectedOrgId, onSelect }) {
    const canCreateMore = organizations.length < 3;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-meta uppercase tracking-wide">
                    Мои организации ({organizations.length}/3)
                </h3>
                {canCreateMore && (
                    <Link href={route('organization.create')} className="btn-ghost text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Создать
                    </Link>
                )}
            </div>

            <div className={`grid gap-4 ${
                organizations.length === 1 ? 'grid-cols-1' :
                    organizations.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                        'grid-cols-1 md:grid-cols-3'
            }`}>
                {organizations.map((org) => {
                    const orgStats = overviewStats[org.id] || {};
                    const isSelected = org.id === selectedOrgId;
                    const statusConfig = {
                        active: { bg: 'var(--color-success)', text: '✅ Активна' },
                        pending_verification: { bg: 'var(--color-warning)', text: '⏳ Ожидает' },
                    };
                    const status = statusConfig[org.status] || statusConfig.pending_verification;

                    return (
                        <button
                            key={org.id}
                            onClick={() => onSelect(org.id)}
                            className={`text-left p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                                isSelected
                                    ? 'border-transparent shadow-lg ring-2'
                                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                            }`}
                            style={{
                                background: isSelected
                                    ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-purple) 100%)'
                                    : 'var(--color-bg-card)',
                                boxShadow: isSelected ? '0 10px 30px rgba(99, 102, 241, 0.3)' : 'none',
                                '--tw-ring-color': isSelected ? 'var(--color-primary)' : undefined,
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                    isSelected ? 'bg-white/20' : ''
                                }`}
                                     style={!isSelected ? { background: 'var(--color-primary-light)' } : {}}>
                                    <svg className={`w-5 h-5 ${isSelected ? 'text-white' : ''}`}
                                         fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                         style={!isSelected ? { color: 'var(--color-primary)' } : {}}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                                    </svg>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-meta'
                                }`}>
                                    {org.pivot?.role}
                                </span>
                            </div>

                            <h4 className={`font-bold text-lg mb-1 truncate ${isSelected ? 'text-white' : 'text-main'}`}>
                                {org.name}
                            </h4>

                            {/* Мини-статистика */}
                            <div className={`flex items-center gap-4 text-xs mt-3 ${
                                isSelected ? 'text-white/80' : 'text-meta'
                            }`}>
                                <div className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <span><strong>{orgStats.students_count || 0}</strong> студ.</span>
                                </div>
                                {orgStats.pending_checks > 0 && (
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <span><strong>{orgStats.pending_checks}</strong> на проверке</span>
                                    </div>
                                )}
                                {orgStats.is_bot_active && (
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <span>Бот</span>
                                    </div>
                                )}
                            </div>

                            <div className={`flex items-center justify-between mt-4 pt-3 border-t text-xs ${
                                isSelected ? 'border-white/20 text-white/90' : ''
                            }`} style={!isSelected ? { borderColor: 'var(--color-border)' } : {}}>
                                <span className={isSelected ? '' : 'text-meta'}>{status.text}</span>
                                <span className={`flex items-center gap-1 font-medium ${
                                    isSelected ? 'text-white' : ''
                                }`} style={!isSelected ? { color: 'var(--color-primary)' } : {}}>
                                    Открыть
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </span>
                            </div>
                        </button>
                    );
                })}

                {/* Карточка "Создать организацию" */}
                {canCreateMore && (
                    <Link
                        href={route('organization.create')}
                        className="p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] hover:border-solid min-h-[180px]"
                        style={{ borderColor: 'var(--color-border)' }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                            style={{ background: 'var(--color-bg-card)' }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 style={{ color: 'var(--color-meta)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                        </div>
                        <p className="font-medium text-main">Новая организация</p>
                        <p className="text-xs text-meta mt-1">
                            Осталось {3 - organizations.length} из 3
                        </p>
                    </Link>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, subtitle }) {
    const icons = {
        users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>,
        'user-active': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>,
        'check-circle': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>,
        'chart-bar': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>,
    };

    return (
        <div className="glass-card p-5 hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-meta">{title}</p>
                    <p className="text-3xl font-bold text-main mt-2">{value}</p>
                    {trend !== undefined && (
                        <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </p>
                    )}
                    {subtitle && <p className="text-xs text-meta mt-1">{subtitle}</p>}
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[icon]}</svg>
                </div>
            </div>
        </div>
    );
}

function QuickActions({ org, stats }) {
    const actions = [
        { label: 'Создать курс', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', href: route('course.index', org.id), color: 'var(--color-accent-sky)' },
        { label: 'Добавить студента', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', href: route('student.index', org.id), color: 'var(--color-accent-amber)' },
        { label: `Проверить работы${stats.pendingChecks > 0 ? ` (${stats.pendingChecks})` : ''}`, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', href: route('progress.check.index', org.id), color: stats.pendingChecks > 0 ? 'var(--color-accent-rose)' : 'var(--color-accent-purple)' },
        { label: 'Управление', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', href: route('organization.show', org.id), color: 'var(--color-primary)' },
    ];

    return (
        <div className="glass-card p-5 lg:col-span-2">
            <h3 className="font-semibold text-main mb-4">⚡ Быстрые действия</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actions.map((action, idx) => (
                    <Link key={idx} href={action.href}
                          className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-md"
                          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                             style={{ background: `${action.color}20`, color: action.color }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon}/>
                            </svg>
                        </div>
                        <span className="font-medium text-main text-sm flex-1">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function TopStudents({ students }) {
    return (
        <div className="glass-card p-5">
            <h3 className="font-semibold text-main mb-4">🏆 Топ студентов</h3>
            {students.length === 0 ? (
                <p className="text-sm text-meta text-center py-6">Пока нет данных</p>
            ) : (
                <div className="space-y-2">
                    {students.map((student, idx) => (
                        <div key={student.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    idx === 1 ? 'bg-gray-200 text-gray-700' :
                                        idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-main truncate">{student.firstname} {student.lastname}</p>
                                <p className="text-xs text-meta truncate">{student.rank || 'Новичок'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{student.score}</p>
                                <p className="text-xs text-meta">баллов</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ActivityFeed({ activity }) {
    const iconColors = {
        blue: { bg: 'var(--color-accent-sky-light)', icon: 'var(--color-accent-sky)' },
        green: { bg: 'var(--color-success)', icon: 'white' },
        purple: { bg: 'var(--color-accent-purple-light)', icon: 'var(--color-accent-purple)' },
    };
    const iconPaths = {
        'user-plus': 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
        'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        'book': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253',
    };

    return (
        <div className="glass-card p-5">
            <h3 className="font-semibold text-main mb-4">🔔 Последние события</h3>
            {activity.length === 0 ? (
                <p className="text-sm text-meta text-center py-6">Пока нет активности</p>
            ) : (
                <div className="space-y-1">
                    {activity.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                 style={{ background: iconColors[item.color]?.bg, color: iconColors[item.color]?.icon }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPaths[item.icon]}/>
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-main">{item.text}</p>
                                <p className="text-xs text-meta mt-0.5">{item.time_human}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StudentDashboard({ studentData, org }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Мои баллы" value={studentData.myScore} icon="chart-bar" subtitle={`Ранг: ${studentData.myRank}`} />
                <StatCard title="Завершено" value={studentData.myProgress} icon="check-circle" subtitle="проверенных работ" />
                <StatCard title="На проверке" value={studentData.myPending} icon="user-active" subtitle="ожидают оценки" />
            </div>

            <div className="glass-card p-6">
                <h3 className="font-semibold text-main mb-4">📚 Продолжить обучение</h3>
                {org?.bot?.is_active ? (
                    <a href={org.bot.telegram_link || '#'} target="_blank" rel="noopener noreferrer"
                       className="btn-primary inline-flex items-center gap-2" style={{ background: '#0088cc' }}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 17.97L4.58 13.216c-.668-.44-.697-1.197-.046-1.512l15.09-7.982c.723-.36 1.487.18 1.223 1.094L18.08 15.792c-.16.563-.78.775-1.247.447l-3.32-2.462-1.427 4.164c-.21.614-.89.747-1.342.329z"/>
                        </svg>
                        Открыть бота в Telegram →
                    </a>
                ) : (
                    <p className="text-meta text-center py-6">Бот организации пока не активен</p>
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6"
                 style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                </svg>
            </div>
            <h3 className="text-xl font-bold text-main mb-2">Создайте первую организацию</h3>
            <p className="text-meta mb-6 max-w-md mx-auto">
                Начните работу, создав организацию и пригласив первых студентов.
            </p>
            <Link href={route('organization.create')} className="btn-primary">+ Создать организацию</Link>
        </div>
    );
}
