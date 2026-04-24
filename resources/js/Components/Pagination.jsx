// resources/js/Components/Pagination.jsx
import { Link } from '@inertiajs/react';

export default function Pagination({ meta }) {
    // Берём массив кнопок из meta.links
    const links = meta?.links;

    if (!links || !Array.isArray(links)) {
        return null;
    }

    // 🔹 Функция для красивых подписей кнопок
    const getLabel = (label) => {
        if (label.includes('Previous') || label.includes('&laquo;')) return '<';
        if (label.includes('Next') || label.includes('&raquo;')) return '>';
        return label; // Номера страниц возвращаем как есть
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Информация о записях */}
            <div className="text-sm text-gray-700 dark:text-gray-300">
                Показано <span className="font-medium">{meta?.from ?? 0}</span> –
                <span className="font-medium"> {meta?.to ?? 0}</span> из
                <span className="font-medium"> {meta?.total ?? 0}</span>
            </div>

            {/* Кнопки навигации */}
            <div className="flex gap-1">
                {links
                    .filter(link => link.url)
                    .map((link, index) => (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            className={`px-3 py-2 text-sm rounded-lg border transition font-medium ${
                                link.active
                                    ? 'bg-emerald-500 text-white border-emerald-500 z-10'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {getLabel(link.label)}
                        </Link>
                    ))}
            </div>
        </div>
    );
}
