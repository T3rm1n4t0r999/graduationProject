import { Link } from '@inertiajs/react';

export default function Pagination({ meta, links }) {
    if (!meta || meta.last_page <= 1) return null;

    const { current_page, last_page, from, to, total, per_page } = meta;

    // Генерация номеров страниц с "умным" ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2; // Количество страниц вокруг текущей

        const rangeStart = Math.max(2, current_page - delta);
        const rangeEnd = Math.min(last_page - 1, current_page + delta);

        // Первая страница всегда видна
        pages.push(1);

        // Ellipsis после первой страницы
        if (rangeStart > 2) {
            pages.push('...');
        }

        // Страницы вокруг текущей
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        // Ellipsis перед последней страницей
        if (rangeEnd < last_page - 1) {
            pages.push('...');
        }

        // Последняя страница (если больше 1)
        if (last_page > 1) {
            pages.push(last_page);
        }

        return pages;
    };

    // Преобразует URL из links в формат, понятный Inertia
    const buildUrl = (page) => {
        if (!links.first) return '#';
        const url = new URL(links.first);
        url.searchParams.set('page', page);
        return url.pathname + url.search;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Информация о текущей странице */}
            <div className="text-sm text-meta order-2 sm:order-1">
                Показано{' '}
                <span className="font-semibold text-main">{from ?? 0}</span>
                {' '}-{' '}
                <span className="font-semibold text-main">{to ?? 0}</span>
                {' '}из{' '}
                <span className="font-semibold text-main">{total}</span>
                {' '}
                <span className="text-xs">
                    (по {per_page} на странице)
                </span>
            </div>

            {/* Кнопки навигации */}
            <nav className="flex items-center gap-1 order-1 sm:order-2">
                {/* Кнопка "Назад" */}
                <Link
                    href={links.prev || '#'}
                    preserveState
                    preserveScroll
                    className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-all ${
                        links.prev
                            ? 'hover:bg-primary/10 text-main cursor-pointer'
                            : 'opacity-40 cursor-not-allowed pointer-events-none'
                    }`}
                    style={{
                        background: links.prev ? 'var(--color-bg-card)' : 'transparent',
                        border: '1px solid var(--color-border)',
                    }}
                    aria-label="Предыдущая страница"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>

                {/* Номера страниц */}
                {pages.map((page, idx) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${idx}`}
                                className="w-9 h-9 flex items-center justify-center text-meta text-sm"
                            >
                                ⋯
                            </span>
                        );
                    }

                    const isActive = page === current_page;
                    const url = buildUrl(page);

                    return (
                        <Link
                            key={page}
                            href={url}
                            preserveState
                            preserveScroll
                            className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                                isActive
                                    ? 'text-white shadow-sm'
                                    : 'text-main hover:scale-105'
                            }`}
                            style={{
                                background: isActive
                                    ? 'var(--color-primary)'
                                    : 'var(--color-bg-card)',
                                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            }}
                        >
                            {page}
                        </Link>
                    );
                })}

                {/* Кнопка "Вперёд" */}
                <Link
                    href={links.next || '#'}
                    preserveState
                    preserveScroll
                    className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-all ${
                        links.next
                            ? 'hover:bg-primary/10 text-main cursor-pointer'
                            : 'opacity-40 cursor-not-allowed pointer-events-none'
                    }`}
                    style={{
                        background: links.next ? 'var(--color-bg-card)' : 'transparent',
                        border: '1px solid var(--color-border)',
                    }}
                    aria-label="Следующая страница"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </nav>
        </div>
    );
}
