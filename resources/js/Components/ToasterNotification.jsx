// resources/js/Components/ToasterNotification.jsx (или прямо в Layout)
import { Toaster } from 'sonner';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function ToasterNotification() {
    const [theme, setTheme] = useState('light');

    // Опция 1: Если тема хранится в HTML атрибуте (стандарт Laravel/Breeze/Jetstream)
    useEffect(() => {
        const htmlElement = document.documentElement;
        const observer = new MutationObserver(() => {
            setTheme(htmlElement.classList.contains('dark') ? 'dark' : 'light');
        });

        observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });

        // Initial check
        setTheme(htmlElement.classList.contains('dark') ? 'dark' : 'light');

        return () => observer.disconnect();
    }, []);

    // Опция 2: Если тема хранится в state/context вашего приложения, используйте её напрямую
    // const { theme } = useThemeContext();

    return (
        <Toaster
            position="top-right"
            theme={theme} // Ключевой момент: передаем 'light' или 'dark'
            richColors     // Делает цвета более насыщенными (опционально)
            closeButton    // Добавляет крестик закрытия (опционально)
            toastOptions={{
                className: 'my-custom-class', // Глобальные стили если нужны
                style: {
                    background: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#333',
                    border: theme === 'dark' ? '1px solid #444' : '1px solid #e5e7eb',
                }
            }}
        />
    );
}
