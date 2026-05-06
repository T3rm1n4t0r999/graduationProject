import { Link } from '@inertiajs/react';
import ApplicationLogo from "@/Components/ApplicationLogo.jsx";
import ThemeToggle from "@/Components/ThemeToggle.jsx";

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
            {/* Декоративный фон */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-30"></div>
            </div>

            {/* Шапка */}
            <header className="relative z-10 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex items-center justify-center w-20">
                            <ApplicationLogo />
                        </div>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            {/* Основной контент */}
            <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm">
                    <div className="glass-card p-6">
                        {children}
                    </div>
                </div>
            </main>

            {/* Футер */}
            <footer className="relative z-10 py-6 text-center text-sm text-meta">
                <p>&copy; {new Date().getFullYear()} EduBot. Платформа для обучения сотрудников.</p>
            </footer>
        </div>
    );
}
