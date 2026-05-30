import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import CreateCourseForm from '@/Pages/Console/Course/CreateCourseForm';
import SortableCourses from '@/Pages/Console/Course/SortableCourses';

export default function List({ auth, organization, courses }) {
    const { filters: initialFilters = {} } = usePage().props;
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        is_active: initialFilters.is_active ?? '',
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        min_modules: initialFilters.min_modules || '',
        max_modules: initialFilters.max_modules || '',
        sort: initialFilters.sort || 'order',
        direction: initialFilters.direction || 'asc',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);

    const applyFilters = (override = {}) => {
        const params = { ...filters, ...override };
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === undefined) delete params[key];
        });
        router.get(
            route('course.index', { organization: organization.id }),
            params,
            { preserveState: true, replace: true }
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.search !== (initialFilters.search || '')) applyFilters();
        }, 400);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const handleChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            is_active: '',
            date_from: '',
            date_to: '',
            min_modules: '',
            max_modules: '',
            sort: 'order',
            direction: 'asc',
        });
        router.get(route('course.index', { organization: organization.id }), {}, { preserveState: true, replace: true });
    };

    const handleCourseCreated = () => {
        setIsCreateCourseModalOpen(false);
        router.reload({ only: ['courses'], preserveScroll: true });
    };

    const handleSaveOrder = async (orderedItems) => {
        return new Promise((resolve, reject) => {
            router.patch(
                route('course.reorder', { organization: organization.id }),
                { items: orderedItems },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ['courses'], preserveScroll: true });
                        resolve();
                    },
                    onError: (error) => reject(error),
                }
            );
        });
    };

    const hasActiveFilters = Object.values(filters).some(
        v => v !== '' && v !== undefined && v !== 'order' && v !== 'asc'
    );

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Заголовок */}
                <div className="glass-card p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl"
                                style={{
                                    background: 'var(--color-accent-sky-light)',
                                    color: 'var(--color-accent-sky)',
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main">Курсы</h1>
                                <p className="text-meta mt-1">
                                    Всего: <span className="font-semibold text-main">{courses.total ?? courses.data.length}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsCreateCourseModalOpen(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            + Создать курс
                        </button>
                    </div>
                </div>

                {/* Поиск и фильтры */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                            placeholder="Поиск по названию и описанию..."
                            className="form-input-glass w-full pl-10 pr-4 py-2 text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-ghost text-sm flex items-center gap-2"
                    >
                        Фильтры {hasActiveFilters && '●'}
                    </button>
                </div>

                {/* Панель фильтров */}
                {showFilters && (
                    <form onSubmit={handleSubmit} className="glass-card p-5 md:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Статус</label>
                                <select
                                    value={filters.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.value)}
                                    className="form-input-glass"
                                >
                                    <option value="">Все</option>
                                    <option value="1">Активные</option>
                                    <option value="0">Неактивные</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Дата с</label>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="date"
                                        value={filters.date_from}
                                        onChange={(e) => handleChange('date_from', e.target.value)}
                                        className="form-input-glass pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Дата по</label>
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="date"
                                        value={filters.date_to}
                                        onChange={(e) => handleChange('date_to', e.target.value)}
                                        className="form-input-glass pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-meta mb-1 uppercase">Модулей от</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.min_modules}
                                        onChange={(e) => handleChange('min_modules', e.target.value)}
                                        className="form-input-glass"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-meta mb-1 uppercase">до</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.max_modules}
                                        onChange={(e) => handleChange('max_modules', e.target.value)}
                                        className="form-input-glass"
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Сортировка</label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleChange('sort', e.target.value)}
                                    className="form-input-glass"
                                >
                                    <option value="order">По порядку</option>
                                    <option value="title">По названию</option>
                                    <option value="created_at">По дате создания</option>
                                    <option value="modules_count">По кол-ву модулей</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Направление</label>
                                <select
                                    value={filters.direction}
                                    onChange={(e) => handleChange('direction', e.target.value)}
                                    className="form-input-glass"
                                >
                                    <option value="asc">По возрастанию</option>
                                    <option value="desc">По убыванию</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-5">
                            <button type="button" onClick={clearFilters} className="btn-ghost text-sm">
                                Сбросить
                            </button>
                            <button type="submit" className="btn-primary text-sm">
                                Применить
                            </button>
                        </div>
                    </form>
                )}

                {/* Сортируемый список курсов */}
                <SortableCourses
                    organization={organization}
                    courses={courses.data}
                    onSaveOrder={handleSaveOrder}
                />
            </div>

            <CreateCourseForm
                isOpen={isCreateCourseModalOpen}
                onClose={() => setIsCreateCourseModalOpen(false)}
                organization={organization}
                onSuccess={handleCourseCreated}
            />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </ConsoleLayout>
    );
}
