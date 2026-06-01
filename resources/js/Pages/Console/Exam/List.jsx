import { useState, useEffect } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import CreateExamForm from './CreateExamForm';
import Pagination from "@/Pages/Console/Pagination.jsx";

function ExamCard({ exam, organizationId }) {
    return (
        <Link
            href={route('exam.show', { organization: organizationId, exam: exam.id })}
            className="glass-card p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col group"
        >
            <div className="flex items-start gap-3 mb-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                        background: 'var(--color-accent-purple-light)',
                        color: 'var(--color-accent-purple)',
                    }}
                >
                    <span className="text-lg font-bold leading-none">К</span>
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-main truncate flex items-center gap-2">
                        {exam.title}
                        {exam.is_active !== undefined && (
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{
                                    background: exam.is_active
                                        ? 'var(--color-success)'
                                        : 'var(--color-text-muted)',
                                }}
                                title={exam.is_active ? 'Активна' : 'Неактивна'}
                            />
                        )}
                    </h3>
                    {exam.description && (
                        <p className="text-sm text-meta mt-0.5 line-clamp-2">{exam.description}</p>
                    )}
                </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-main">{exam.questions_count ?? 0}</span>
                        <span className="text-xs text-meta">Вопросы</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-main">{exam.max_score ?? 0}</span>
                        <span className="text-xs text-meta">Баллы</span>
                    </div>
                    <div className="flex flex-col items-center">
                        {exam.time_limit ? (
                            <>
                                <span className="text-sm font-semibold text-main">{exam.time_limit}</span>
                                <span className="text-xs text-meta">Мин</span>
                            </>
                        ) : (
                            <span className="text-xs text-meta">Без лимита</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function List({ auth, organization, exams, modules = [], freeModules = [] }) {
    const { filters: initialFilters = {} } = usePage().props;
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        module_id: initialFilters.module_id || '',
        is_active: initialFilters.is_active ?? '',
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        min_questions: initialFilters.min_questions || '',
        max_questions: initialFilters.max_questions || '',
        sort: initialFilters.sort || 'created_at',
        direction: initialFilters.direction || 'desc',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);

    const applyFilters = (override = {}) => {
        const params = { ...filters, ...override };
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === undefined) delete params[key];
        });
        router.get(
            route('exam.index', { organization: organization.id }),
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
            module_id: '',
            is_active: '',
            date_from: '',
            date_to: '',
            min_questions: '',
            max_questions: '',
            sort: 'created_at',
            direction: 'desc',
        });
        router.get(route('exam.index', { organization: organization.id }), {}, { preserveState: true, replace: true });
    };

    const handleExamCreated = () => {
        setIsCreateExamModalOpen(false);
        router.reload({ only: ['exams'], preserveScroll: true });
    };

    const modulesForFilter = modules?.data || modules || [];
    const freeModulesForForm = freeModules?.data || freeModules || [];
    const hasActiveFilters = Object.values(filters).some(
        v => v !== '' && v !== undefined && v !== 'created_at' && v !== 'desc'
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
                                    background: 'var(--color-accent-purple-light)',
                                    color: 'var(--color-accent-purple)',
                                }}
                            >
                                <span className="text-xl font-bold leading-none">КР</span>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main">Контрольные работы</h1>
                                <p className="text-meta mt-1">
                                    Всего: <span className="font-semibold text-main">{exams.total ?? exams.data.length}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsCreateExamModalOpen(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            + Создать КР
                        </button>
                    </div>
                </div>

                {/* Поиск и фильтры */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <span
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-base leading-none"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            ⌕
                        </span>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                            placeholder="Поиск..."
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

                {showFilters && (
                    <form onSubmit={handleSubmit} className="glass-card p-5 md:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Модуль</label>
                                <select
                                    value={filters.module_id}
                                    onChange={(e) => handleChange('module_id', e.target.value)}
                                    className="form-input-glass"
                                >
                                    <option value="">Все модули</option>
                                    {modulesForFilter.map(mod => (
                                        <option key={mod.id} value={mod.id}>{mod.title}</option>
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
                                <input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => handleChange('date_from', e.target.value)}
                                    className="form-input-glass"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Дата по</label>
                                <input
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => handleChange('date_to', e.target.value)}
                                    className="form-input-glass"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-meta mb-1 uppercase">Вопросов от</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.min_questions}
                                        onChange={(e) => handleChange('min_questions', e.target.value)}
                                        className="form-input-glass"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-meta mb-1 uppercase">до</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.max_questions}
                                        onChange={(e) => handleChange('max_questions', e.target.value)}
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
                                    <option value="created_at">По дате создания</option>
                                    <option value="title">По названию</option>
                                    <option value="questions_count">По кол-ву вопросов</option>
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

                {/* Карточки */}
                {exams.data.length === 0 ? (
                    <div className="glass-card p-12 text-center text-meta">Нет контрольных работ</div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {exams.data.map((exam) => (
                                <ExamCard key={exam.id} exam={exam} organizationId={organization.id} />
                            ))}
                        </div>
                        {exams.links && <Pagination links={exams.links} />}
                    </>
                )}
            </div>

            <CreateExamForm
                isOpen={isCreateExamModalOpen}
                onClose={() => setIsCreateExamModalOpen(false)}
                organization={organization}
                modules={freeModulesForForm}
                onSuccess={handleExamCreated}
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
