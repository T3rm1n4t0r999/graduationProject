import { Link, usePage } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
import Dropdown from '@/Components/Dropdown';
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import ToasterNotification from "@/Components/ToasterNotification.jsx";

const sidebarLinks = [
    { label: 'Статистика', href: (orgId) => route('organization.console', { organization: orgId }) },
    { label: 'Курсы', href: (orgId) => route('course.index', { organization: orgId }) },
    { label: 'Модули', href: (orgId) => route('module.index', { organization: orgId }) },
    { label: 'Уроки', href: (orgId) => route('lesson.index', { organization: orgId }) },
    {
        label: 'Практические задания',
        href: (orgId) => route('task.index', { organization: orgId }),
        children: [
            { label: 'Вопросы', href: (orgId) => route('question.task.index', { organization: orgId }) },
            { label: 'Материалы', href: (orgId) => route('material.index', { organization: orgId }) },
        ],
    },
    {
        label: 'Домашние задания',
        href: (orgId) => route('homework.index', { organization: orgId }),
        children: [
            { label: 'Вопросы', href: (orgId) => route('question.homework.index', { organization: orgId }) },
        ],
    },
    {
        label: 'Контрольные работы',
        href: (orgId) => route('exam.index', { organization: orgId }),
        children: [
            { label: 'Вопросы', href: (orgId) => route('question.exam.index', { organization: orgId }) },
        ],
    },
    { label: 'Группы', href: (orgId) => route('group.index', { organization: orgId }) },
    { label: 'Студенты', href: (orgId) => route('student.index', { organization: orgId }) },
    { label: 'Проверка заданий', href: (orgId) => route('progress.check.index', { organization: orgId })},
];

export default function ConsoleLayout({ children }) {

    const [openSubmenus, setOpenSubmenus] = useState({});

    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('console_sidebar_open');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const toggleSidebar = () => {
        setSidebarOpen(prev => {
            const next = !prev;
            localStorage.setItem('console_sidebar_open', JSON.stringify(next));
            return next;
        });
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        localStorage.setItem('console_sidebar_open', 'false');
    };

    const { auth, organization = [], flash } = usePage().props;
    const user = auth.user;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const toggleSubmenu = (label) => {
        setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <div className="min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 top-16 z-10 bg-black bg-opacity-25 backdrop-blur-sm md:hidden"
                    onClick={closeSidebar}
                />
            )}

            <aside
                className={`fixed top-16 md:top-0 left-0 z-20 w-64 flex flex-col border-r transform transition-transform duration-300 ease-in-out h-[calc(100vh-4rem)] md:h-screen ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                    background: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                }}
            >
                {/* Верхняя часть: логотип и кнопка "К организации" */}
                <div className="flex-shrink-0 px-6 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <Link href={route('organization.show', { organization: organization.id })} className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                            style={{ background: 'var(--color-primary)' }}
                        >
                            {organization.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                                {organization.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Консоль управления</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        if (link.children) {
                            const parentUrl = link.href(organization.id);
                            const parentActive = route().current(parentUrl);
                            const childActive = link.children.some((child) =>
                                route().current(child.href(organization.id))
                            );
                            const isActive = parentActive || childActive;
                            const isOpen = openSubmenus[link.label] || false;

                            return (
                                <div key={link.label}>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={parentUrl}
                                            className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                isActive ? 'shadow-sm' : ''
                                            }`}
                                            style={
                                                isActive
                                                    ? { background: 'var(--color-primary-light)', color: 'var(--color-primary)' }
                                                    : { background: 'transparent', color: 'var(--color-text-secondary)' }
                                            }
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.background = 'var(--color-primary-light)';
                                                    e.currentTarget.style.color = 'var(--color-primary)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                                                }
                                            }}
                                            onClick={() => {
                                                if (window.innerWidth < 768) closeSidebar();
                                            }}
                                        >
                                            <span>{link.label}</span>
                                        </Link>
                                        <button
                                            onClick={() => toggleSubmenu(link.label)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            style={{ color: 'var(--color-text-secondary)' }}
                                            aria-label={`Раскрыть ${link.label}`}
                                        >
                                            <span className={`inline-block text-sm transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                                                ›
                                            </span>
                                        </button>
                                    </div>
                                    {isOpen && (
                                        <div className="ml-6 mt-1 space-y-1">
                                            {link.children.map((child) => {
                                                const childUrl = child.href(organization.id);
                                                const childActive = route().current(childUrl);
                                                return (
                                                    <Link
                                                        key={child.label}
                                                        href={childUrl}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                            childActive ? 'shadow-sm' : ''
                                                        }`}
                                                        style={
                                                            childActive
                                                                ? { background: 'var(--color-primary-light)', color: 'var(--color-primary)' }
                                                                : { background: 'transparent', color: 'var(--color-text-secondary)' }
                                                        }
                                                        onMouseEnter={(e) => {
                                                            if (!childActive) {
                                                                e.currentTarget.style.background = 'var(--color-primary-light)';
                                                                e.currentTarget.style.color = 'var(--color-primary)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!childActive) {
                                                                e.currentTarget.style.background = 'transparent';
                                                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            if (window.innerWidth < 768) closeSidebar();
                                                        }}
                                                    >
                                                        <span>{child.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        const url = link.href(organization.id);
                        const isActive = route().current(url);
                        return (
                            <Link
                                key={link.label}
                                href={url}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    isActive ? 'shadow-sm' : ''
                                }`}
                                style={
                                    isActive
                                        ? { background: 'var(--color-primary-light)', color: 'var(--color-primary)' }
                                        : { background: 'transparent', color: 'var(--color-text-secondary)' }
                                }
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'var(--color-primary-light)';
                                        e.currentTarget.style.color = 'var(--color-primary)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                                    }
                                }}
                                onClick={() => {
                                    if (window.innerWidth < 768) closeSidebar();
                                }}
                            >
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Нижняя часть: только переключатель темы */}
                <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-end">
                        <ThemeToggle />
                    </div>
                </div>
            </aside>

            {/* Основная область */}
            <div
                className={`min-h-screen flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
                    sidebarOpen ? 'md:ml-64' : 'ml-0'
                }`}
            >
                <header className="glass-header sticky top-0 z-30">
                    <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSidebar}
                                className="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                style={{ color: 'var(--color-text-secondary)' }}
                                aria-label="Переключить боковую панель"
                            >
                                <span className="text-xl leading-none">
                                    {sidebarOpen ? '×' : '≡'}
                                </span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">


                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition"
                                        style={{
                                            borderColor: 'var(--color-border)',
                                            background: 'var(--color-bg-card)',
                                            color: 'var(--color-text-primary)',
                                        }}
                                    >
                                        <span
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
                                            style={{ background: 'var(--color-primary)' }}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="hidden sm:inline truncate max-w-[120px]">{user.name}</span>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content className="dropdown-glass">
                                    <Dropdown.Link href={route('profile.edit')}>Профиль</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Выйти
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>
                <ToasterNotification />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
