import { Link } from '@inertiajs/react';
import ActivateTaskButton from '@/Pages/Console/Lesson/ActivateTaskButton';

export default function MaterialCard({ task, organization }) {
    return (
        <div
            className={`block rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
                task.is_active
                    ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-card)]'
                    : ''
            }`}
            style={{
                background: task.is_active
                    ? 'var(--color-primary-light)'
                    : 'var(--color-bg-card-hover)',
                boxShadow: task.is_active
                    ? '0 0 0 1px var(--color-primary), 0 4px 12px rgba(0,0,0,0.05)'
                    : 'none',
            }}
        >
            <div className="flex items-start justify-between gap-4 ">
                {/* Кликабельная часть — переход на задание */}
                <Link
                    href={route('lessonTask.show', {
                        organization: organization.id,
                        lessonTask: task.id,
                    })}
                    className="min-w-0 flex-1"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <h3
                            className={`text-lg font-bold truncate ${
                                task.is_active ? 'text-primary' : ''
                            }`}
                            style={{ color: task.is_active ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
                        >
                            {task.title}
                        </h3>
                        {task.is_active && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white whitespace-nowrap">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Активно
                            </span>
                        )}
                    </div>
                    {task.description && (
                        <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                            {task.description}
                        </p>
                    )}
                </Link>

                {/* Правая часть: баллы и кнопка активации */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                         style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-1-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        {task.max_score ?? 0}
                        <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>баллов</span>
                    </div>

                    {/* Кнопка активации (только для неактивных заданий) */}
                    {!task.is_active && (
                        <ActivateTaskButton task={task} />
                    )}
                </div>
            </div>
        </div>
    );
}
