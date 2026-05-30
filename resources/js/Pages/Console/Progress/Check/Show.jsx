import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';

export default function Show({ auth, organization, progress, questions }) {
    const typeLabels = {
        lesson_task: 'Задание урока',
        homework: 'Домашнее задание',
        exam: 'Контрольная работа',
    };

    const isAutoCorrect = (question, studentAnswer) => {
        if (studentAnswer === null || studentAnswer === undefined) return false;
        if (!question.correct_answers) return false;
        switch (question.question_type) {
            case 'text':
                const correctTexts = question.correct_answers
                    .map(idx => question.options?.[idx]?.text?.trim().toLowerCase())
                    .filter(Boolean);
                return correctTexts.includes(String(studentAnswer).trim().toLowerCase());
            case 'single_choice':
                return studentAnswer == question.correct_answers[0];
            case 'multiple_choice':
                if (!Array.isArray(studentAnswer)) return false;
                return JSON.stringify([...question.correct_answers].map(String).sort()) ===
                    JSON.stringify([...studentAnswer].map(String).sort());
            default:
                return false;
        }
    };

    // Инициализация баллов
    const [questionPoints, setQuestionPoints] = useState(() => {
        const initial = {};
        questions.forEach(q => {
            if (q.question_type === 'free_text') {
                initial[q.id] = 0;
            } else {
                const correct = isAutoCorrect(q, q.student_answer);
                initial[q.id] = correct ? q.points : 0;
            }
        });
        return initial;
    });

    const [explanations, setExplanations] = useState(() => {
        const initial = {};
        questions.forEach(q => {
            if (q.question_type === 'free_text') {
                initial[q.id] = progress.free_text_explanations?.[q.id] || '';
            }
        });
        return initial;
    });

    const { data, setData, put, processing } = useForm({
        question_points: questionPoints,
        question_explanations: explanations,
        checked: true,
    });

    const totalPoints = useMemo(() => {
        return Object.values(questionPoints).reduce((sum, p) => sum + p, 0);
    }, [questionPoints]);

    const maxPoints = progress.max_points || questions.reduce((sum, q) => sum + (q.points || 0), 0);
    const percent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    const handleScoreChange = (questionId, value) => {
        const newValue = Math.max(0, Math.min(value, questions.find(q => q.id === questionId)?.points || 0));
        setQuestionPoints(prev => ({ ...prev, [questionId]: newValue }));
    };



    useEffect(() => {
        setData('question_points', questionPoints);
    }, [questionPoints]);

    useEffect(() => {
        setData('question_explanations', explanations);
    }, [explanations]);

    const submit = (e) => {
        e.preventDefault();
        put(route('progress.check.update', {
            organization: organization.id,
            progress: progress.id,
        }), {
            preserveScroll: true,
        });
    };

    // Рендер ответа студента
    const renderAnswer = (question, studentAnswer) => {
        if (studentAnswer === null || studentAnswer === undefined) {
            return <span className="text-meta italic">Нет ответа</span>;
        }
        switch (question.question_type) {
            case 'text':
            case 'free_text':
                return <span className="text-main whitespace-pre-wrap">{studentAnswer}</span>;
            case 'single_choice': {
                const option = question.options?.[studentAnswer]?.text;
                return <span className="text-main">{option || 'Неизвестный вариант'}</span>;
            }
            case 'multiple_choice': {
                if (!Array.isArray(studentAnswer)) return <span className="text-main">{studentAnswer}</span>;
                const labels = studentAnswer.map(idx => question.options?.[idx]?.text).filter(Boolean);
                return <span className="text-main">{labels.join(', ') || '—'}</span>;
            }
            default:
                return <span className="text-main">{JSON.stringify(studentAnswer)}</span>;
        }
    };

    // Правильный ответ
    const renderCorrectAnswer = (question) => {
        if (!question.correct_answers?.length) return <span className="text-meta italic">Не указан</span>;
        switch (question.question_type) {
            case 'text':
            case 'free_text': {
                const texts = question.correct_answers
                    .map(idx => question.options?.[idx]?.text)
                    .filter(Boolean);
                return (
                    <span style={{ color: 'var(--color-success)' }}>
                        {texts.join(', ') || '—'}
                    </span>
                );
            }
            case 'single_choice':
                return (
                    <span style={{ color: 'var(--color-success)' }}>
                        {question.options?.[question.correct_answers[0]]?.text || '—'}
                    </span>
                );
            case 'multiple_choice': {
                const labels = question.correct_answers.map(idx => question.options?.[idx]?.text).filter(Boolean);
                return (
                    <span style={{ color: 'var(--color-success)' }}>
                        {labels.join(', ') || '—'}
                    </span>
                );
            }
            default:
                return (
                    <span style={{ color: 'var(--color-success)' }}>
                        {JSON.stringify(question.correct_answers)}
                    </span>
                );
        }
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <Head title={`Проверка: ${progress.title}`} />

            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                {/* Заголовок */}
                <div className="glass-card p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div
                                className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl"
                                style={{
                                    background: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)',
                                }}
                            >
                                <span className="text-2xl">✓</span>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main truncate">
                                    {progress.title}
                                </h1>
                                <p className="text-meta mt-1 flex flex-wrap items-center gap-2">
                                    <span>{progress.student_name}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="badge">{typeLabels[progress.type] || progress.type}</span>
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('progress.check.index', { organization: organization.id })}
                            className="btn-ghost text-sm self-start"
                        >
                            ← К списку проверок
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Итоговая информация + прогресс-бар */}
                    <div className="glass-card p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-main mb-5 flex items-center gap-2">
                            <span style={{ color: 'var(--color-text-secondary)' }}>⭐</span>
                            Результат проверки
                        </h2>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl font-bold text-main">
                                    {totalPoints}
                                    <span className="text-xl text-meta font-normal">/{maxPoints}</span>
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-meta">Прогресс</span>
                                        <span className="text-xs font-medium text-main">{percent}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${percent}%`,
                                                background: percent === 100
                                                    ? 'var(--color-success)'
                                                    : percent > 50
                                                        ? 'var(--color-primary)'
                                                        : 'var(--color-warning)',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={data.checked}
                                    onChange={(e) => setData('checked', e.target.checked)}
                                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-main">Отметить как проверенное</span>
                            </label>
                        </div>
                    </div>

                    {/* Вопросы и ответы */}
                    <div className="glass-card p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-main mb-6 flex items-center gap-2">
                            <span style={{ color: 'var(--color-text-secondary)' }}>❓</span>
                            Вопросы и ответы
                        </h2>

                        <div className="space-y-6">
                            {questions.map((q, i) => {
                                const isFreeText = q.question_type === 'free_text';
                                const correct = !isFreeText && q.student_answer != null && isAutoCorrect(q, q.student_answer);
                                const noAnswer = q.student_answer === null || q.student_answer === undefined;

                                return (
                                    <div
                                        key={q.id}
                                        className="border border-gray-100 dark:border-gray-700/60 rounded-2xl p-5 transition-all hover:shadow-sm"
                                    >
                                        {/* Заголовок вопроса */}
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <h3 className="text-base font-semibold text-main">
                                                <span className="text-indigo-600 dark:text-indigo-400 mr-2">Q{i + 1}.</span>
                                                {q.question}
                                            </h3>
                                            <span className="badge whitespace-nowrap">{q.points} балл.</span>
                                        </div>

                                        {/* Ответ студента */}
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-meta mb-1.5 uppercase tracking-wide">
                                                {isFreeText ? 'Свободный ответ (проверка вручную)' : 'Ответ студента'}
                                            </p>
                                            <div
                                                className="p-3 rounded-xl border"
                                                style={{
                                                    background: isFreeText
                                                        ? 'var(--color-primary-light)'
                                                        : noAnswer
                                                            ? 'rgba(var(--color-warning), 0.1)'
                                                            : correct
                                                                ? 'rgba(var(--color-success), 0.1)'
                                                                : 'rgba(var(--color-error), 0.1)',
                                                    borderColor: isFreeText
                                                        ? 'var(--color-primary)'
                                                        : noAnswer
                                                            ? 'var(--color-warning)'
                                                            : correct
                                                                ? 'var(--color-success)'
                                                                : 'var(--color-error)',
                                                }}
                                            >
                                                {q.question_type === 'text' || isFreeText ? (
                                                    renderAnswer(q, q.student_answer)
                                                ) : q.question_type === 'single_choice' || q.question_type === 'multiple_choice' ? (
                                                    <div className="space-y-2">
                                                        {q.options?.map((opt, idx) => {
                                                            const isChosen = q.question_type === 'single_choice'
                                                                ? q.student_answer == idx
                                                                : Array.isArray(q.student_answer) && q.student_answer.includes(String(idx));
                                                            const isCorrectOption = q.correct_answers?.includes(String(idx));
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-center gap-3 p-2 rounded-lg text-sm"
                                                                    style={{
                                                                        background: isChosen ? 'var(--color-primary-light)' : 'transparent',
                                                                        border: isChosen ? '1px solid var(--color-primary)' : '1px solid transparent',
                                                                    }}
                                                                >
                                                                    <span
                                                                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                                                        style={{
                                                                            borderColor: isChosen ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                                                            background: isChosen ? 'var(--color-primary)' : 'transparent',
                                                                            color: isChosen ? 'white' : 'inherit',
                                                                        }}
                                                                    >
                                                                        {isChosen && '✓'}
                                                                    </span>
                                                                    <span className="text-main">{opt.text}</span>
                                                                    {isCorrectOption && (
                                                                        <span
                                                                            className="ml-auto text-xs font-medium"
                                                                            style={{ color: 'var(--color-success)' }}
                                                                        >
                                                                            ✓ верный
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    renderAnswer(q, q.student_answer)
                                                )}
                                            </div>
                                        </div>

                                        {/* Для free_text — ручной ввод баллов */}
                                        {isFreeText && (
                                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <label className="text-sm font-medium text-main">Оценка:</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={q.points}
                                                        value={questionPoints[q.id] ?? 0}
                                                        onChange={(e) => handleScoreChange(q.id, parseInt(e.target.value) || 0)}
                                                        className="form-input-glass w-24 text-center text-sm"
                                                    />
                                                    <span className="text-meta text-sm">из {q.points} баллов</span>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-main">Пояснение:</label>
                                                    <textarea
                                                        value={explanations[q.id] || ''}
                                                        onChange={(e) => setExplanations(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                        className="form-input-glass w-full mt-1 text-sm"
                                                        rows={2}
                                                        maxLength={500}
                                                        placeholder="Пояснение к оценке..."
                                                    />
                                                    <p className="text-xs text-meta mt-1">
                                                        {(explanations[q.id] || '').length}/500 символов
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Автоматическая оценка + правильный ответ */}
                                        {!isFreeText && (
                                            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                                                <div>
                                                    <span className="text-meta">Правильный ответ: </span>
                                                    {renderCorrectAnswer(q)}
                                                </div>
                                                <div className="ml-auto">
                                                    {noAnswer ? (
                                                        <span
                                                            className="inline-flex items-center gap-1 font-medium"
                                                            style={{ color: 'var(--color-warning)' }}
                                                        >
                                                            <span>⚠️</span>
                                                            Нет ответа
                                                        </span>
                                                    ) : correct ? (
                                                        <span
                                                            className="inline-flex items-center gap-1 font-medium"
                                                            style={{ color: 'var(--color-success)' }}
                                                        >
                                                            <span>✓</span>
                                                            Верно ({questionPoints[q.id]}/{q.points})
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="inline-flex items-center gap-1 font-medium"
                                                            style={{ color: 'var(--color-error)' }}
                                                        >
                                                            <span>✗</span>
                                                            Неверно ({questionPoints[q.id]}/{q.points})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex justify-end gap-4">
                        <Link
                            href={route('progress.check.index', { organization: organization.id })}
                            className="btn-ghost"
                        >
                            Отмена
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Сохранение...
                                </>
                            ) : (
                                'Сохранить проверку'
                            )}
                        </button>
                    </div>
                </form>
            </div>

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
