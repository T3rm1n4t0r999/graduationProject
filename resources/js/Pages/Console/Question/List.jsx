import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CreateQuestionForm from "@/Pages/Console/Question/CreateQuestionForm.jsx";

function QuestionCard({ question, organizationId }) {
    const getTypeLabel = (type) => {
        const labels = {
            single_choice: 'Один вариант',
            multiple_choice: 'Несколько вариантов',
            text: 'Текстовый ответ',
        };
        return labels[type] || type;
    };

    const getParentLabel = (parent) => {
        if (!parent) return 'Не привязан';
        return parent.title || `ID: ${parent.id}`;
    };

    return (
        <Link
            href={route('question.show', {
                organization: organizationId,
                question: question.id,
            })}
            className="glass-card p-6 hover:shadow-md transition-shadow flex flex-col justify-between group"
        >
            <div>
                <div className="flex items-start justify-between mb-2">
                    <h3
                        className="text-lg font-semibold group-hover:underline"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {question.question?.substring(0, 80) || 'Без названия'}
                        {question.question?.length > 80 ? '...' : ''}
                    </h3>
                    <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                            background: 'var(--color-primary)',
                            color: '#fff'
                        }}
                    >
                        {getTypeLabel(question.question_type)}
                    </span>
                </div>
                <p
                    className="text-sm line-clamp-2 mb-3"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {question.explanation || 'Нет пояснения'}
                </p>
                <div className="flex items-center gap-4 text-xs mb-2">
                    <span style={{ color: 'var(--color-text-muted)' }}>
                        Баллы: <strong style={{ color: 'var(--color-primary)' }}>{question.points}</strong>
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                        Порядок: {question.order}
                    </span>
                </div>
                <div
                    className="mt-2 pt-3 border-t text-xs"
                    style={{ borderColor: 'var(--color-border)' }}
                >
                    <span style={{ color: 'var(--color-text-muted)' }}>
                        Привязан к: {getParentLabel(question.questionable)}
                    </span>
                </div>
            </div>
            <div
                className="mt-4 pt-4 border-t flex items-center justify-between text-xs"
                style={{ borderColor: 'var(--color-border)' }}
            >
                <span style={{ color: 'var(--color-text-muted)' }}>
                    Вариантов: {question.options?.length || 0}
                </span>
                <span className="flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                    Подробнее
                </span>
            </div>
        </Link>
    );
}

export default function List({ auth, organization, questions, tasks }) {
    const [isCreateQuestionModalOpen, setIsCreateQuestionModalOpen] = useState(false);

    const handleQuestionCreated = () => {
        setIsCreateQuestionModalOpen(false);
        router.reload({ only: ['questions'], preserveScroll: true });
    };

    return (
        <ConsoleLayout
            auth={auth}
            organization={organization}
            header={
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Вопросы ({questions.length})
                </h1>
            }
        >
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <button onClick={() => setIsCreateQuestionModalOpen(true)} className="btn-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Создать вопрос
                    </button>
                </div>

                {questions.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                            Пока нет ни одного вопроса.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {questions.data.map((question) => (
                            <QuestionCard key={question.id} question={question} organizationId={organization.id} />
                        ))}
                    </div>
                )}
            </div>

            <CreateQuestionForm
                isOpen={isCreateQuestionModalOpen}
                onClose={() => setIsCreateQuestionModalOpen(false)}
                organization={organization}
                tasks={tasks.data}
                onSuccess={handleQuestionCreated}
            />
        </ConsoleLayout>
    );
}
