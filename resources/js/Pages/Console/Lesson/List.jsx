import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CreateLessonForm from '@/Pages/Console/Lesson/CreateLessonForm';

function LessonCard({ lesson, organizationId }) {
    return (
        <Link
            href={route('lesson.show', {
                organization: organizationId,
                lesson: lesson.id,
            })}
            className="glass-card p-6 hover:shadow-md transition-shadow flex flex-col justify-between group"
        >
            <div>
                <h3
                    className="text-lg font-semibold mb-2 group-hover:underline"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {lesson.title}
                </h3>
                <p
                    className="text-sm line-clamp-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {lesson.description || 'Описание отсутствует'}
                </p>
            </div>
            <div
                className="mt-4 pt-4 border-t flex items-center justify-between text-xs"
                style={{ borderColor: 'var(--color-border)' }}
            >
                <span style={{ color: 'var(--color-text-muted)' }}>
                    задания: {lesson?.tasks_count ? lesson?.tasks_count : '0'}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                    материалы: {lesson?.materials_count ? lesson?.materials_count : '0'}
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

export default function List({ auth, organization, lessons, modules }) {
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);

    const handleLessonCreated = () => {
        setIsCreateLessonModalOpen(false);
        router.reload({ only: ['lessons'], preserveScroll: true });
    };

    return (
        <ConsoleLayout
            auth={auth}
            organization={organization}
            header={
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Модули
                </h1>
            }
        >
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <button onClick={() => setIsCreateLessonModalOpen(true)} className="btn-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Создать урок
                    </button>
                </div>

                {lessons.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                            Пока нет ни одного урока.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {lessons.data.map((lesson) => (
                            <LessonCard key={lesson.id} lesson={lesson} organizationId={organization.id} />
                        ))}
                    </div>
                )}
            </div>

            <CreateLessonForm
                isOpen={isCreateLessonModalOpen}
                onClose={() => setIsCreateLessonModalOpen(false)}
                organization={organization}
                modules={modules.data}
                onSuccess={handleLessonCreated}
            />
        </ConsoleLayout>
    );
}
