import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import CreateModuleForm from '@/Pages/Console/Module/CreateModuleForm';
import ModuleCard from "@/Pages/Console/Module/ModuleCard.jsx";

export default function List({ auth, organization, modules, courses }) {
    const { filters: initialFilters = {} } = usePage().props;
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        course_id: initialFilters.course_id || '',
        is_active: initialFilters.is_active ?? '',
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        min_lessons: initialFilters.min_lessons || '',
        max_lessons: initialFilters.max_lessons || '',
        sort: initialFilters.sort || 'order',
        direction: initialFilters.direction || 'asc',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);

    const applyFilters = (override = {}) => {
        const params = { ...filters, ...override };
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === undefined) delete params[key];
        });
        router.get(
            route('module.index', { organization: organization.id }),
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
            course_id: '',
            is_active: '',
            date_from: '',
            date_to: '',
            min_lessons: '',
            max_lessons: '',
            sort: 'order',
            direction: 'asc',
        });
        router.get(route('module.index', { organization: organization.id }), {}, { preserveState: true, replace: true });
    };

    const handleModuleCreated = () => {
        setIsCreateModuleModalOpen(false);
        router.reload({ only: ['modules'], preserveScroll: true });
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
                                    background: 'var(--color-accent-amber-light)',
                                    color: 'var(--color-accent-amber)',
                                }}
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main">Модули</h1>
                                <p className="text-meta mt-1">
                                    Всего: <span className="font-semibold text-main">{modules.total ?? modules.data.length}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsCreateModuleModalOpen(true)} className="btn-primary flex items-center gap-2">
                            + Создать модуль
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
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Курс</label>
                                <select
                                    value={filters.course_id}
                                    onChange={(e) => handleChange('course_id', e.target.value)}
                                    className="form-input-glass"
                                >
                                    <option value="">Все курсы</option>
                                    {courses?.data?.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>
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
                                    <label className="block text-xs font-medium text-meta mb-1 uppercase">Уроков от</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.min_lessons}
                                        onChange={(e) => handleChange('min_lessons', e.target.value)}
                                        className="form-input-glass"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-meta mb-1 uppercase">до</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.max_lessons}
                                        onChange={(e) => handleChange('max_lessons', e.target.value)}
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
                                    <option value="course_title">По курсу</option>
                                    <option value="created_at">По дате создания</option>
                                    <option value="lessons_count">По кол-ву уроков</option>
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
                            <button type="button" onClick={clearFilters} className="btn-ghost text-sm">Сбросить</button>
                            <button type="submit" className="btn-primary text-sm">Применить</button>
                        </div>
                    </form>
                )}

                {/* Список модулей */}
                {modules.data.length === 0 ? (
                    <div className="glass-card p-12 text-center text-meta">
                        Пока нет ни одного модуля.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {modules.data.map((module) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                organization={organization}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateModuleForm
                isOpen={isCreateModuleModalOpen}
                onClose={() => setIsCreateModuleModalOpen(false)}
                organization={organization}
                courses={courses.data}
                onSuccess={handleModuleCreated}
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
