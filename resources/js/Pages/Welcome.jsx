import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="EduBot - Обучение сотрудников" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                EduBot
                            </span>
                        </div>
                        
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        Войти
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        Регистрация
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="pt-20 pb-16">
                    <div className="max-w-4xl mx-auto px-6">
                        {/* Hero Section */}
                        <section className="py-20 text-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                                Обучение сотрудников через Telegram
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                                Платформа для создания обучающих ботов, которые помогают обучать и тестировать сотрудников прямо в мессенджере
                            </p>
                            <div className="flex gap-4 justify-center">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-6 py-3 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        Перейти в кабинет
                                    </Link>
                                ) : (
                                    <Link
                                        href="/register"
                                        className="px-6 py-3 text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        Начать бесплатно
                                    </Link>
                                )}
                            </div>
                        </section>

                        {/* Features */}
                        <section className="py-16">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Быстрый старт</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Создайте бота за несколько минут и начните обучение сотрудников без сложных настроек
                                    </p>
                                </div>

                                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Для команд</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Управляйте доступом, отслеживайте прогресс каждого сотрудника и анализируйте результаты
                                    </p>
                                </div>

                                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Тестирование</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Создавайте тесты и проверяйте знания сотрудников автоматически в удобном формате
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* How it works */}
                        <section className="py-16">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12">
                                Как это работает
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                                        1
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Создайте бота</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Подключите вашего Telegram бота к платформе
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                                        2
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Добавьте материалы</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Загрузите учебные материалы и создайте тесты
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                                        3
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Пригласите команду</h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Сотрудники начнут обучение в Telegram
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200 dark:border-slate-700 py-8">
                    <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 dark:text-slate-400">
                        <p>&copy; 2024 EduBot. Платформа для обучения сотрудников.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}