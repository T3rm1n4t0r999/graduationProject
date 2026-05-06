import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDark(isDark);
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.theme = 'light';
            setDark(false);
        } else {
            html.classList.add('dark');
            localStorage.theme = 'dark';
            setDark(true);
        }
    };

    // Иконки солнца и луны (можно заменить на свои SVG)
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Переключить тему"
        >
            {dark ? (
                // Иконка солнца (включить светлую тему)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                // Иконка луны (включить тёмную тему)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    );
}
