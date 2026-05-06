// resources/js/Pages/Dashboard.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, organizations, stats }) {
    // 🔹 Первая организация пользователя (или выбор активной)
    const activeOrg = organizations?.[0];
    const userRole = activeOrg?.pivot?.role; // 'owner', 'manager', 'teacher', 'student'

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    👋 Привет, {auth.user.name}!
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* 🔹 Блок 1: Статус организации */}
                    {activeOrg && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{activeOrg.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Роль: <span className="font-medium">{userRole?.label || userRole}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Статус верификации */}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    activeOrg.status === 'verified'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                    {activeOrg.status === 'verified' ? '✅ Подтверждено' : '⏳ Ожидает подтверждения'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 🔹 Блок 2: Статистика (для владельцев/менеджеров) */}
                    {(userRole === 'owner' || userRole === 'manager') && stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Всего студентов"
                                value={stats.totalStudents}
                                icon="users"
                                trend={stats.studentsGrowth}
                            />
                            <StatCard
                                title="Активных ботов"
                                value={stats.activeBots}
                                icon="robot"
                                color="emerald"
                            />
                            <StatCard
                                title="Завершено уроков"
                                value={stats.completedLessons}
                                icon="check-circle"
                                color="blue"
                            />
                            <StatCard
                                title="Средний прогресс"
                                value={`${stats.averageProgress}%`}
                                icon="chart-bar"
                                color="purple"
                            />
                        </div>
                    )}

                    {/* 🔹 Блок 3: Быстрые действия */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">⚡ Быстрые действия</h3>
                        <div className="flex flex-wrap gap-3">
                            {(userRole === 'owner' || userRole === 'manager') && (
                                <>
                                    <Link
                                        href={route('organization.show', activeOrg?.id)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        Управление организацией
                                    </Link>
                                    <Link
                                        href={route('invitation.create')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                                        </svg>
                                        Пригласить пользователя
                                    </Link>
                                </>
                            )}

                            {/* Кнопка открытия бота в Telegram для всех */}
                            {activeOrg?.bot?.telegram_link && (
                                <a
                                    href={activeOrg.bot.telegram_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 17.97L4.58 13.216c-.668-.44-.697-1.197-.046-1.512l15.09-7.982c.723-.36 1.487.18 1.223 1.094L18.08 15.792c-.16.563-.78.775-1.247.447l-3.32-2.462-1.427 4.164c-.21.614-.89.747-1.342.329z"/>
                                    </svg>
                                    Открыть бота в Telegram
                                </a>
                            )}
                        </div>
                    </div>

                    {/* 🔹 Блок 4: Для студентов — прогресс обучения */}
                    {userRole === 'student' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📚 Ваше обучение</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Введение в компанию</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Модуль 1 из 5</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-emerald-600">75%</span>
                                        <p className="text-xs text-gray-500">прогресс</p>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>

                                <Link
                                    href={activeOrg?.bot?.telegram_link || '#'}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Продолжить в Telegram →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* 🔹 Блок 5: Последние активности */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">🔔 Последние события</h3>
                        <div className="space-y-3">
                            <ActivityItem
                                icon="user-plus"
                                color="blue"
                                text="Новый сотрудник присоединился к организации"
                                time="2 часа назад"
                            />
                            <ActivityItem
                                icon="check"
                                color="green"
                                text="Студент завершил модуль «Безопасность»"
                                time="5 часов назад"
                            />
                            <ActivityItem
                                icon="bot"
                                color="purple"
                                text="Бот обновлён: добавлены новые вопросы"
                                time="Вчера"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// 🔹 Вспомогательные компоненты (можно вынести в отдельные файлы)

function StatCard({ title, value, icon, color = 'indigo', trend }) {
    const icons = {
        users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>,
        robot: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>,
        'check-circle': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>,
        'chart-bar': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>,
    };

    const colors = {
        indigo: 'from-indigo-500 to-purple-600',
        emerald: 'from-emerald-500 to-teal-600',
        blue: 'from-blue-500 to-cyan-600',
        purple: 'from-purple-500 to-pink-600',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% за неделю
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {icons[icon]}
                    </svg>
                </div>
            </div>
        </div>
    );
}

function ActivityItem({ icon, color, text, time }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    };

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center shrink-0`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon === 'user-plus' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>}
                    {icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>}
                    {icon === 'bot' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>}
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{time}</p>
            </div>
        </div>
    );
}
