import { Link } from '@inertiajs/react';
import ApplicationLogo from "@/Components/ApplicationLogo.jsx";
import ThemeToggle from "@/Components/ThemeToggle.jsx";

export default function WelcomeLayout({ auth, children }) {
    return (
        <div
            className="relative min-h-screen"
            style={{ background: 'var(--color-bg)' }}
        >
            {/* Контентная колонка */}
            <div className="relative z-10 flex flex-col h-full">
                <header className="glass-header sticky top-0 z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-20">
                                <ApplicationLogo />
                            </div>
                        </Link>

                        <nav className="flex items-center gap-4">
                            <Link href={route('guide')} className="btn-ghost">
                                Как пользоваться платформой
                            </Link>
                            {auth?.user ? (
                                <Link href="/dashboard" className="btn-ghost">
                                    Личный кабинет
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="btn-ghost">
                                        Войти
                                    </Link>
                                    <Link href="/register" className="btn-primary">
                                        Регистрация
                                    </Link>
                                </>
                            )}
                            <ThemeToggle />
                        </nav>
                    </div>
                </header>

                <main className="flex-grow">
                    {children}
                </main>

                <footer className="text-meta border-t py-6 text-center text-sm"
                        style={{ borderColor: 'var(--color-border)' }}>
                    <p>&copy; {new Date().getFullYear()} EduBot. Платформа для обучения сотрудников.</p>
                </footer>
            </div>
        </div>
    );
}
