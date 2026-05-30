import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, organization, student, progress, questions }) {
    const typeLabels = {
        lesson_task: 'Задание урока',
        homework: 'Домашнее задание',
        exam: 'Контрольная работа',
    };

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

    const renderCorrectAnswer = (question) => {
        if (!question.correct_answers || question.correct_answers.length === 0) {
            return <span className="text-meta italic">Не указан</span>;
        }
        switch (question.question_type) {
            case 'text':
            case 'free_text': {
                const texts = question.correct_answers
                    .map(idx => question.options?.[idx]?.text)
                    .filter(Boolean);
                return (
                    <span style={{ color: 'var(--color-success)' }}>
                        {texts.length ? texts.join(', ') : '—'}
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
                const labels = question.correct_answers
                    .map(idx => question.options?.[idx]?.text)
                    .filter(Boolean);
                return (
                    <span style={{ color: 'var(--color-success)' }}>
                        {labels.length ? labels.join(', ') : '—'}
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

    const isAnswerCorrect = (question, studentAnswer) => {
        if (studentAnswer === null || studentAnswer === undefined) return false;
        if (!question.correct_answers) return false;
        switch (question.question_type) {
            case 'text': {
                const correctTexts = question.correct_answers
                    .map(idx => question.options?.[idx]?.text?.trim().toLowerCase())
                    .filter(Boolean);
                const normalizedAnswer = String(studentAnswer).trim().toLowerCase();
                return correctTexts.includes(normalizedAnswer);
            }
            case 'single_choice':
                return studentAnswer == question.correct_answers[0];
            case 'multiple_choice':
                if (!Array.isArray(studentAnswer)) return false;
                const correct = question.correct_answers.map(String).sort();
                const given = studentAnswer.map(String).sort();
                return JSON.stringify(correct) === JSON.stringify(given);
            default:
                return false;
        }
    };

    const percent = progress.max_points > 0 ? Math.round((progress.points / progress.max_points) * 100) : 0;

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <Head title={`Прогресс: ${progress.title}`} />

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
                                <span className="text-2xl">📊</span>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main truncate">
                                    {progress.title}
                                </h1>
                                <p className="text-meta mt-1 flex flex-wrap items-center gap-2">
                                    <span>{student.lastname} {student.firstname}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="badge">{typeLabels[progress.type] || progress.type}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={route('progress.check.show', { organization: organization.id, progress: progress.id })} className="btn-primary text-sm">
                                Проверить
                            </Link>
                            <Link
                                href={route('student.progress.index', { organization: organization.id, student: student.id })}
                                className="btn-ghost text-sm self-start"
                            >
                                ← К списку
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Общая информация — сетка карточек */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard
                        icon={<span className="text-xl">⭐</span>}
                        label="Баллы"
                        value={`${progress.points} / ${progress.max_points}`}
                        highlight
                    />
                    <InfoCard
                        icon={<span className="text-xl">🔄</span>}
                        label="Попытка"
                        value={`#${progress.attempt}`}
                    />
                    <InfoCard
                        icon={
                            <span
                                className="text-xl"
                                style={{
                                    color: progress.checked
                                        ? 'var(--color-success)'
                                        : 'var(--color-warning)',
                                }}
                            >
                                {progress.checked ? '✓' : '⏳'}
                            </span>
                        }
                        label="Статус"
                        value={progress.checked ? 'Проверено' : 'Ожидает проверки'}
                        valueClassName={progress.checked ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}
                    />
                    <InfoCard
                        icon={<span className="text-xl">📅</span>}
                        label="Дата"
                        value={progress.created_at}
                    />
                    {progress.checked_by && (
                        <InfoCard
                            icon={<span className="text-xl">👤</span>}
                            label="Проверил"
                            value={progress.checked_by}
                        />
                    )}
                </div>

                {/* Прогресс-бар */}
                {progress.max_points > 0 && (
                    <div className="glass-card p-5 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-main">Прогресс</span>
                            <span className="text-sm font-semibold text-main">{percent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
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
                )}

                {/* Прикрепленные файлы */}
                {progress.attached_files?.length > 0 && (
                    <div className="glass-card p-6 md:p-8">
                        <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
                            <span style={{ color: 'var(--color-text-secondary)' }}>📎</span>
                            Прикреплённые файлы
                        </h2>
                        <ul className="space-y-2">
                            {progress.attached_files.map((file, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <span className="text-meta">📄</span>
                                    <a
                                        href={file.url || file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium truncate"
                                    >
                                        {file.name || `Файл ${idx + 1}`}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Вопросы и ответы */}
                <div className="glass-card p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-main mb-6 flex items-center gap-2">
                        <span style={{ color: 'var(--color-text-secondary)' }}>❓</span>
                        Вопросы и ответы
                    </h2>
                    {questions.length === 0 ? (
                        <p className="text-meta text-center py-6">Нет вопросов</p>
                    ) : (
                        <div className="space-y-6">
                            {questions.map((q, i) => {
                                const correct = q.student_answer !== null && q.student_answer !== undefined && isAnswerCorrect(q, q.student_answer);
                                const noAnswer = q.student_answer === null || q.student_answer === undefined;
                                return (
                                    <div
                                        key={q.id}
                                        className="border border-gray-100 dark:border-gray-700/60 rounded-2xl p-5 transition-all hover:shadow-sm"
                                    >
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <h3 className="text-base font-semibold text-main">
                                                <span className="text-indigo-600 dark:text-indigo-400 mr-2">Q{i + 1}.</span>
                                                {q.question}
                                            </h3>
                                            <span className="badge whitespace-nowrap">{q.points} балл.</span>
                                        </div>

                                        {/* Ответ студента */}
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-meta mb-1.5 uppercase tracking-wide">Ответ студента</p>
                                            <div
                                                className="p-3 rounded-xl border"
                                                style={{
                                                    background: noAnswer
                                                        ? 'rgba(var(--color-warning), 0.1)'
                                                        : correct
                                                            ? 'rgba(var(--color-success), 0.1)'
                                                            : 'rgba(var(--color-error), 0.1)',
                                                    borderColor: noAnswer
                                                        ? 'var(--color-warning)'
                                                        : correct
                                                            ? 'var(--color-success)'
                                                            : 'var(--color-error)',
                                                }}
                                            >
                                                {q.question_type === 'text' || q.question_type === 'free_text' ? (
                                                    renderAnswer(q, q.student_answer)
                                                ) : (
                                                    <div className="space-y-2">
                                                        {q.options?.map((opt, idx) => {
                                                            const isChosen = q.question_type === 'single_choice'
                                                                ? q.student_answer == idx
                                                                : Array.isArray(q.student_answer) && q.student_answer.includes(String(idx));
                                                            const isCorrectOption = q.correct_answers?.includes(String(idx));
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                                                                        isChosen
                                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                                            : 'border border-transparent'
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center`}
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
                                                )}
                                            </div>
                                        </div>

                                        {/* Правильный ответ и пояснение */}
                                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                                            <div>
                                                <span className="text-meta">Правильный ответ: </span>
                                                {renderCorrectAnswer(q)}
                                            </div>
                                            {q.explanation && (
                                                <div className="text-meta">
                                                    <span className="mr-1">•</span>
                                                    {q.explanation}
                                                </div>
                                            )}
                                            <div className="ml-auto">
                                                {noAnswer ? (
                                                    <span
                                                        className="inline-flex items-center gap-1 font-medium"
                                                        style={{ color: 'var(--color-warning)' }}
                                                    >
                                                        ⚠️ Нет ответа
                                                    </span>
                                                ) : correct ? (
                                                    <span
                                                        className="inline-flex items-center gap-1 font-medium"
                                                        style={{ color: 'var(--color-success)' }}
                                                    >
                                                        ✓ Верно
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="inline-flex items-center gap-1 font-medium"
                                                        style={{ color: 'var(--color-error)' }}
                                                    >
                                                        ✗ Неверно
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ConsoleLayout>
    );
}

// Вспомогательный компонент для карточек статистики
function InfoCard({ icon, label, value, highlight, valueClassName = '' }) {
    return (
        <div className="glass-card p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
            <div
                className="p-2 rounded-lg"
                style={{
                    background: highlight ? 'var(--color-primary-light)' : 'var(--color-bg-card-hover)',
                    color: highlight ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}
            >
                {icon}
            </div>
            <div>
                <p className="text-xs text-meta mb-0.5">{label}</p>
                <p className={`text-sm font-semibold text-main ${valueClassName}`}>{value}</p>
            </div>
        </div>
    );
}
