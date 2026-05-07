import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, organizations, stats }) {
    const activeOrg = organizations?.[0];
    const userRole = activeOrg?.pivot?.role;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold text-main">
                    👋 Привет, {auth.user.name}!
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Организация */}
                    {activeOrg && (
                        <div className="glass-card p-5">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ background: 'var(--color-primary)' }}
                                    >
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-main">{activeOrg.name}</h3>
                                        <p className="text-sm text-meta">
                                            Роль: <span className="font-medium">{userRole}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                      style={{
                                          background: activeOrg.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)',
                                          color: 'white',
                                      }}>
                                    {activeOrg.status === 'active' ? '✅ Подтверждено' : '⏳ Ожидает подтверждения'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Статистика */}
                    {(userRole === 'owner' || userRole === 'manager') && stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Всего студентов" value={stats.totalStudents} icon="users" trend={stats.studentsGrowth} />
                            <StatCard title="Активных ботов" value={stats.activeBots} icon="robot" />
                            <StatCard title="Завершено уроков" value={stats.completedLessons} icon="check-circle" />
                            <StatCard title="Средний прогресс" value={`${stats.averageProgress}%`} icon="chart-bar" />
                        </div>
                    )}

                    {/* Быстрые действия */}
                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-main mb-4">⚡ Быстрые действия</h3>
                        <div className="flex flex-wrap gap-3">
                            {(userRole === 'owner' || userRole === 'manager') && (
                                <>
                                    <Link href={route('organization.show', activeOrg?.id)} className="btn-primary">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        Управление организацией
                                    </Link>
                                </>
                            )}

                            {activeOrg?.bot?.telegram_link && (
                                <a
                                    href={activeOrg.bot.telegram_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary"
                                    style={{ background: '#0088cc' }}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 17.97L4.58 13.216c-.668-.44-.697-1.197-.046-1.512l15.09-7.982c.723-.36 1.487.18 1.223 1.094L18.08 15.792c-.16.563-.78.775-1.247.447l-3.32-2.462-1.427 4.164c-.21.614-.89.747-1.342.329z"/>
                                    </svg>
                                    Открыть бота в Telegram
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Прогресс студента */}
                    {userRole === 'student' && (
                        <div className="glass-card p-5">
                            <h3 className="font-semibold text-main mb-4">📚 Ваше обучение</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg"
                                     style={{ background: 'var(--color-bg-card)' }}>
                                    <div>
                                        <p className="font-medium text-main">Введение в компанию</p>
                                        <p className="text-sm text-meta">Модуль 1 из 5</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>75%</span>
                                        <p className="text-xs text-meta">прогресс</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="h-2 rounded-full" style={{ width: '75%', background: 'var(--color-success)' }}></div>
                                </div>
                                <Link
                                    href={activeOrg?.bot?.telegram_link || '#'}
                                    target="_blank"
                                    className="btn-primary"
                                >
                                    Продолжить в Telegram →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Последние события */}
                    <div className="glass-card p-5">
                        <h3 className="font-semibold text-main mb-4">🔔 Последние события</h3>
                        <div className="space-y-3">
                            <ActivityItem icon="user-plus" color="blue" text="Новый сотрудник присоединился к организации" time="2 часа назад" />
                            <ActivityItem icon="check" color="green" text="Студент завершил модуль «Безопасность»" time="5 часов назад" />
                            <ActivityItem icon="bot" color="purple" text="Бот обновлён: добавлены новые вопросы" time="Вчера" />
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Компоненты StatCard и ActivityItem – без изменений в структуре, но с улучшенными цветами
function StatCard({ title, value, icon, color = 'indigo', trend }) {
    const icons = {
        users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>,
        robot: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>,
        'check-circle': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>,
        'chart-bar': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>,
    };

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-meta">{title}</p>
                    <p className="text-2xl font-bold text-main mt-1">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% за неделю
                        </p>
                    )}
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {icons[icon]}
                    </svg>
                </div>
            </div>
        </div>
    );
}

function ActivityItem({ icon, color, text, time }) {
    const iconColors = {
        blue: { bg: 'var(--color-primary-light)', icon: 'var(--color-primary)' },
        green: { bg: 'var(--color-success)', icon: 'white' },
        purple: { bg: 'var(--color-primary-light)', icon: 'var(--color-primary)' },
    };

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: iconColors[color]?.bg, color: iconColors[color]?.icon }}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon === 'user-plus' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>}
                    {icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>}
                    {icon === 'bot' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>}
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-main">{text}</p>
                <p className="text-xs text-meta mt-0.5">{time}</p>
            </div>
        </div>
    );
}
