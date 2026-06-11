import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link } from '@inertiajs/react';
import CreateQuestionForm from "@/Pages/Console/Question/CreateQuestionForm.jsx";
import Pagination from "@/Components/Pagination.jsx";

function QuestionCard({ question, organizationId }) {
    const getTypeLabel = (type) => {
        const labels = {
            single_choice: 'Один вариант',
            multiple_choice: 'Несколько вариантов',
            text: 'Текстовый ответ',
            free_text: 'Свободный ответ',
        };
        return labels[type] || type;
    };

    const getParentLabel = (parent) => {
        if (!parent) return 'Не привязан';
        return parent.title || `ID: ${parent.id}`;
    };

    const getParentLink = (questionable) => {
        if (!questionable?.type || !questionable.id) return null;
        switch (questionable.type) {
            case 'lesson_task':
                return route('task.show', { organization: organizationId, task: questionable.id });
            case 'homework':
                return route('homework.show', { organization: organizationId, homework: questionable.id });
            case 'exam':
                return route('exam.show', { organization: organizationId, exam: questionable.id });
            default:
                return null;
        }
    };

    return (
        <Link
            href={route('question.show', {
                organization: organizationId,
                question: question.id,
            })}
            className="glass-card p-5 hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col group"
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-main truncate flex items-center gap-2">
                        <span className="truncate">
                            {question.question?.substring(0, 80) || 'Без названия'}
                            {question.question?.length > 80 ? '...' : ''}
                        </span>
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                                background: question.is_active
                                    ? 'var(--color-success)'
                                    : 'var(--color-text-muted)',
                            }}
                            title={question.is_active ? 'Активен' : 'Неактивен'}
                        />
                    </h3>
                    <span className="badge text-xs whitespace-nowrap flex-shrink-0">
                        {getTypeLabel(question.question_type)}
                    </span>
                </div>
                <p className="text-sm line-clamp-2 text-meta mb-3">
                    {question.explanation || 'Нет пояснения'}
                </p>
                <div className="flex items-center gap-4 text-xs mb-2">
                    <span className="text-label">
                        Баллы: <span className="font-semibold text-main">{question.points}</span>
                    </span>
                    <span className="text-label">Порядок: {question.order}</span>
                </div>
                <div className="pt-3 border-t text-xs" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-label">
                        Привязан к:{' '}
                        {question.questionable && getParentLink(question.questionable) ? (
                            <Link
                                href={getParentLink(question.questionable)}
                                className="hover:text-main underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {getParentLabel(question.questionable)}
                            </Link>
                        ) : (
                            getParentLabel(question.questionable)
                        )}
                    </span>
                </div>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between text-xs">
                <span className="text-label">
                    Вариантов: {question.options?.length || 0}
                </span>
                <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                    Подробнее →
                </span>
            </div>
        </Link>
    );
}

export default function List({ auth, organization, questions, context, tasks = [], homeworks = [], exams = [] }) {
    const { filters: initialFilters = {} } = usePage().props;
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        parent_id: initialFilters.task_id || initialFilters.homework_id || initialFilters.exam_id || '',
        question_type: initialFilters.question_type || '',
        is_active: initialFilters.is_active ?? '',
        min_points: initialFilters.min_points || '',
        max_points: initialFilters.max_points || '',
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || '',
        sort: initialFilters.sort || 'order',
        direction: initialFilters.direction || 'asc',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isCreateQuestionModalOpen, setIsCreateQuestionModalOpen] = useState(false);

    const parentList = (() => {
        switch (context) {
            case 'task': return tasks  || [];
            case 'homework': return  homeworks || [];
            case 'exam': return exams || [];
            default: return [];
        }
    })();

    const parentParamName = {
        task: 'task_id',
        homework: 'homework_id',
        exam: 'exam_id',
    }[context];

    const applyFilters = (override = {}) => {
        const params = { ...filters, ...override };
        if (params.parent_id) {
            params[parentParamName] = params.parent_id;
        } else {
            delete params[parentParamName];
        }
        delete params.parent_id;

        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === undefined) delete params[key];
        });
        router.get(
            route(`question.${context}.index`, { organization: organization.id }),
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
            parent_id: '',
            question_type: '',
            is_active: '',
            min_points: '',
            max_points: '',
            date_from: '',
            date_to: '',
            sort: 'order',
            direction: 'asc',
        });
        router.get(
            route(`question.${context}.index`, { organization: organization.id }),
            {},
            { preserveState: true, replace: true }
        );
    };

    const handleQuestionCreated = () => {
        setIsCreateQuestionModalOpen(false);
        router.reload({ only: ['questions'], preserveScroll: true });
    };

    const parentsForForm = parentList;
    const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== undefined && v !== 'order' && v !== 'asc');

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
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main">Вопросы</h1>
                                <p className="text-meta mt-1">
                                    Всего: <span className="font-semibold text-main">{questions.total ?? 0}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsCreateQuestionModalOpen(true)} className="btn-primary flex items-center gap-2">
                            + Создать вопрос
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
                            placeholder="Поиск по тексту и пояснению..."
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
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">
                                    {context === 'task' ? 'Задание' : context === 'homework' ? 'ДЗ' : 'КР'}
                                </label>
                                <select
                                    value={filters.parent_id}
                                    onChange={(e) => handleChange('parent_id', e.target.value)}
                                    className="form-input-glass"
                                >
                                    <option value="">Все</option>
                                    {parentList.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Тип вопроса</label>
                                <select
                                    value={filters.question_type}
                                    onChange={(e) => handleChange('question_type', e.target.value)}
                                    className="form-input-glass"
                                >
                                    <option value="">Все типы</option>
                                    <option value="single_choice">Один вариант</option>
                                    <option value="multiple_choice">Несколько вариантов</option>
                                    <option value="text">Текстовый ответ</option>
                                    <option value="free_text">Свободный ответ</option>
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
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-meta mb-1 uppercase">Баллы от</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.min_points}
                                        onChange={(e) => handleChange('min_points', e.target.value)}
                                        className="form-input-glass"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-meta mb-1 uppercase">до</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={filters.max_points}
                                        onChange={(e) => handleChange('max_points', e.target.value)}
                                        className="form-input-glass"
                                        placeholder="100"
                                    />
                                </div>
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
                            <div>
                                <label className="block text-xs font-medium text-meta mb-1 uppercase">Сортировка</label>
                                <select
                                    value={filters.sort}
                                    onChange={(e) => handleChange('sort', e.target.value)}
                                    className="form-input-glass"
                                >
                                    <option value="order">По порядку</option>
                                    <option value="question">По тексту</option>
                                    <option value="points">По баллам</option>
                                    <option value="created_at">По дате создания</option>
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

                {/* Список вопросов с пагинацией */}
                {questions.data.length === 0 ? (
                    <div className="glass-card p-12 text-center text-meta">
                        Пока нет ни одного вопроса.
                    </div>
                ) : (
                    <div className="glass-card p-6 md:p-8">
                        {/* ✅ Grid ОТДЕЛЬНО */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {questions.data.map((question) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    organizationId={organization.id}
                                />
                            ))}
                        </div>

                        {/* ✅ Пагинация ПОСЛЕ grid с meta и links */}
                        <Pagination
                            meta={questions.meta}
                            links={questions.links}
                        />
                    </div>
                )}
            </div>

            <CreateQuestionForm
                isOpen={isCreateQuestionModalOpen}
                onClose={() => setIsCreateQuestionModalOpen(false)}
                organization={organization}
                parents={parentsForForm}
                context={context}
                onSuccess={handleQuestionCreated}
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
