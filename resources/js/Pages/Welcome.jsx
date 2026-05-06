import React from 'react';
import { Head, Link } from '@inertiajs/react';
import WelcomeLayout from '@/Layouts/WelcomeLayout';

export default function Welcome({ auth }) {
    return (
        <WelcomeLayout auth={auth}>
            <Head title="EduBot - Обучение сотрудников" />

            {/* Hero Section */}
            <section className="py-20 text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-main mb-6">
                        Обучение сотрудников через Telegram
                    </h1>
                    <p className="text-lg text-meta mb-8 max-w-2xl mx-auto">
                        Платформа для создания обучающих ботов, которые помогают обучать и тестировать сотрудников прямо в мессенджере
                    </p>
                    <div className="flex gap-4 justify-center">
                        {auth.user ? (
                            <Link href="/dashboard" className="btn-primary">
                                Перейти в кабинет
                            </Link>
                        ) : (
                            <Link href="/register" className="btn-primary">
                                Начать бесплатно
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Карточка 1 */}
                        <div className="glass-card p-6">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                style={{
                                    background: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)',
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-main mb-2">Быстрый старт</h3>
                            <p className="text-meta">
                                Создайте бота за несколько минут и начните обучение сотрудников без сложных настроек
                            </p>
                        </div>

                        {/* Карточка 2 */}
                        <div className="glass-card p-6">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                style={{
                                    background: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)',
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-main mb-2">Для команд</h3>
                            <p className="text-meta">
                                Управляйте доступом, отслеживайте прогресс каждого сотрудника и анализируйте результаты
                            </p>
                        </div>

                        {/* Карточка 3 */}
                        <div className="glass-card p-6">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                style={{
                                    background: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)',
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-main mb-2">Тестирование</h3>
                            <p className="text-meta">
                                Создавайте тесты и проверяйте знания сотрудников автоматически в удобном формате
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-main text-center mb-12">
                        Как это работает
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold"
                                style={{ background: 'var(--color-primary)' }}
                            >
                                1
                            </div>
                            <h3 className="font-semibold text-main mb-2">Создайте бота</h3>
                            <p className="text-meta">
                                Подключите вашего Telegram бота к платформе
                            </p>
                        </div>
                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold"
                                style={{ background: 'var(--color-primary)' }}
                            >
                                2
                            </div>
                            <h3 className="font-semibold text-main mb-2">Добавьте материалы</h3>
                            <p className="text-meta">
                                Загрузите учебные материалы и создайте тесты
                            </p>
                        </div>
                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold"
                                style={{ background: 'var(--color-primary)' }}
                            >
                                3
                            </div>
                            <h3 className="font-semibold text-main mb-2">Пригласите команду</h3>
                            <p className="text-meta">
                                Сотрудники начнут обучение в Telegram
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </WelcomeLayout>
    );
}
