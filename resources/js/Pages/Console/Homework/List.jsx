
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CreateHomeworkForm from './CreateHomeworkForm';

function HomeworkCard({ homework, organizationId }) {

    return (
        <Link
            href={route('homework.show', {
                organization: organizationId,
                homework: homework.id,
            })}
            className="glass-card p-6 hover:shadow-md transition-shadow flex flex-col justify-between group"
        >
            <div>
                <h3
                    className="text-lg font-semibold mb-2 group-hover:underline"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {homework.title}
                </h3>
                <p
                    className="text-sm line-clamp-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {homework.description || 'Описание отсутствует'}
                </p>
            </div>
            <div
                className="mt-4 pt-4 border-t flex items-center justify-between text-xs"
                style={{ borderColor: 'var(--color-border)' }}
            >
                <span style={{ color: 'var(--color-text-muted)' }}>
                    Вопросы: {homework?.questions_count ? homework?.questions_count : '0'}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    Макс. балл: {homework?.max_score ? homework?.max_score : '0'}
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

export default function List({ auth, organization, homeworks, lessons }) {
    const [isCreateHomeworkModalOpen, setIsCreateHomeworkModalOpen] = useState(false);
    console.log(lessons)
    const handleHomeworkCreated = () => {
        setIsCreateHomeworkModalOpen(false);
        router.reload({ only: ['homeworks'], preserveScroll: true });
    };

    return (
        <ConsoleLayout
            auth={auth}
            organization={organization}
            header={
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Домашние задания
                </h1>
            }
        >
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <button onClick={() => setIsCreateHomeworkModalOpen(true)} className="btn-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Создать домашнее задание
                    </button>
                </div>

                {homeworks.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                            Пока нет ни одного домашнего задания.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {homeworks.data.map((homework) => (
                            <HomeworkCard key={homework.id} homework={homework} organizationId={organization.id} />
                        ))}
                    </div>
                )}
            </div>

            <CreateHomeworkForm
                isOpen={isCreateHomeworkModalOpen}
                onClose={() => setIsCreateHomeworkModalOpen(false)}
                organization={organization}
                lessons={lessons.data}
                onSuccess={handleHomeworkCreated}
            />
        </ConsoleLayout>
    );
}
