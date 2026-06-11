import React from 'react';
import { Head, Link } from '@inertiajs/react';
import WelcomeLayout from '@/Layouts/WelcomeLayout';

export default function Welcome({ auth }) {
    return (
        <WelcomeLayout auth={auth}>
            <Head title="EduBot - Обучение сотрудников" />

            {/* Hero Section */}
            <div className="pt-40 py-20 text-center">
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
            </div>
        </WelcomeLayout>
    );
}
