import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AssignModal from "@/Pages/Console/Student/AssignModal.jsx";
import StyledCheckbox from '@/Components/StyledCheckbox';

export default function Show({ auth, organization, student, availableCourses, availableHomeworks, availableExams }) {
    const [modal, setModal] = useState(null);
    const closeModal = () => setModal(null);

    const [selectedCourseIds, setSelectedCourseIds] = useState([]);
    const [selectedHomeworkIds, setSelectedHomeworkIds] = useState([]);
    const [selectedExamIds, setSelectedExamIds] = useState([]);

    const assignCourses = (ids) => {
        router.post(route('student.course.assign', {
            organization: organization.id,
            student: student.id,
        }), { course_ids: ids }, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const assignHomeworks = (ids) => {
        router.post(route('student.homework.assign', {
            organization: organization.id,
            student: student.id,
        }), { homework_ids: ids }, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const assignExams = (ids) => {
        router.post(route('student.exam.assign', {
            organization: organization.id,
            student: student.id,
        }), { exam_ids: ids }, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const removeBatch = (routeName, ids) => {
        if (ids.length === 0) return;
        router.post(route(routeName, {
            organization: organization.id,
            student: student.id,
        }), { ids }, {
            preserveScroll: true,
        });
        if (routeName.includes('course')) setSelectedCourseIds([]);
        else if (routeName.includes('homework')) setSelectedHomeworkIds([]);
        else if (routeName.includes('exam')) setSelectedExamIds([]);
    };

    const toggleId = (id, selectedIds, setSelectedIds) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAll = (allItems, selectedIds, setSelectedIds) => {
        if (selectedIds.length === allItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allItems.map(item => item.id));
        }
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Заголовок */}
                <div className="glass-card p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                {student.lastname?.[0]}{student.firstname?.[0]}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-main truncate">
                                    {student.lastname} {student.firstname}
                                </h1>
                                <p className="text-meta mt-1">
                                    @{student.username} • Telegram ID: {student.telegram_id}
                                </p>

                                {student.groups && student.groups.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {student.groups.map(group => (
                                            <Link
                                                key={group.id}
                                                href={route('group.show', { organization: organization.id, group: group.id })}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-800/30"
                                                style={{
                                                    background: 'var(--color-primary-light)',
                                                    color: 'var(--color-primary)',
                                                    borderColor: 'var(--color-primary)',
                                                }}
                                            >
                                                <span className="mr-1 font-bold">G</span>
                                                {group.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-start">
                            <div
                                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-lg font-bold whitespace-nowrap"
                                style={{
                                    background: 'var(--color-accent-amber-light)',
                                    color: 'var(--color-accent-amber)',
                                }}
                            >
                                <span>★</span>
                                {student.score}
                            </div>
                            <Link
                                href={route('student.progress.index', { organization: organization.id, student: student.id })}
                                className="btn-primary"
                            >
                                Прогресс
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Курсы */}
                <Section
                    title="Курсы"
                    items={student.courses}
                    itemLabelKey="course.title"
                    selectedIds={selectedCourseIds}
                    setSelectedIds={setSelectedCourseIds}
                    toggleAll={() => toggleAll(student.courses, selectedCourseIds, setSelectedCourseIds)}
                    toggleItem={(id) => toggleId(id, selectedCourseIds, setSelectedCourseIds)}
                    removeBatch={() => removeBatch('student.course.remove', selectedCourseIds)}
                    onAssign={() => setModal('course')}
                    assignLabel="Назначить курс"
                />

                {/* Домашние задания */}
                <Section
                    title="Домашние задания"
                    items={student.homeworks}
                    itemLabelKey="homework.title"
                    selectedIds={selectedHomeworkIds}
                    setSelectedIds={setSelectedHomeworkIds}
                    toggleItem={(id) => toggleId(id, selectedHomeworkIds, setSelectedHomeworkIds)}
                    toggleAll={() => toggleAll(student.homeworks, selectedHomeworkIds, setSelectedHomeworkIds)}
                    removeBatch={() => removeBatch('student.homework.remove', selectedHomeworkIds)}
                    onAssign={() => setModal('homework')}
                    assignLabel="Назначить ДЗ"
                    hint="Домашние задания назначаются студенту автоматически после прохождения всех заданий урока, к которому они привязаны."
                />

                {/* Контрольные работы */}
                <Section
                    title="Контрольные работы"
                    items={student.exams}
                    itemLabelKey="exam.title"
                    selectedIds={selectedExamIds}
                    setSelectedIds={setSelectedExamIds}
                    toggleItem={(id) => toggleId(id, selectedExamIds, setSelectedExamIds)}
                    toggleAll={() => toggleAll(student.exams, selectedExamIds, setSelectedExamIds)}
                    removeBatch={() => removeBatch('student.exam.remove', selectedExamIds)}
                    onAssign={() => setModal('exam')}
                    assignLabel="Назначить КР"
                    hint="Контрольные работы назначаются автоматически после завершения всех уроков модуля."
                />
            </div>

            <AssignModal
                show={modal === 'course'}
                onClose={closeModal}
                title="Выберите курсы"
                items={availableCourses}
                onAssign={assignCourses}
            />
            <AssignModal
                show={modal === 'homework'}
                onClose={closeModal}
                title="Выберите ДЗ"
                items={availableHomeworks}
                onAssign={assignHomeworks}
            />
            <AssignModal
                show={modal === 'exam'}
                onClose={closeModal}
                title="Выберите КР"
                items={availableExams}
                onAssign={assignExams}
            />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
            `}</style>
        </ConsoleLayout>
    );
}

function Section({ title, items, itemLabelKey, selectedIds, setSelectedIds, toggleAll, removeBatch, onAssign, assignLabel, hint, toggleItem }) {
    const getName = (item) => {
        const keys = itemLabelKey.split('.');
        let val = item;
        keys.forEach(k => val = val?.[k]);
        return val || 'Без названия';
    };

    return (
        <div className="glass-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-main">
                    {title}
                </h2>
                <button onClick={onAssign} className="btn-primary">
                    + {assignLabel}
                </button>
            </div>

            {/* Подсказка */}
            {hint && (
                <div className="flex items-start gap-3 p-4 mb-4 rounded-xl border"
                     style={{
                         background: 'var(--color-primary-light)',
                         borderColor: 'var(--color-primary)',
                         color: 'var(--color-text-secondary)',
                     }}
                >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                              background: 'var(--color-primary)',
                              color: 'white',
                          }}
                    >
                        i
                    </span>
                    <span className="text-sm leading-relaxed">{hint}</span>
                </div>
            )}

            {items.length === 0 ? (
                <p className="text-meta text-center py-4">Нет назначенных элементов</p>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-3">
                        <button onClick={toggleAll} className="btn-ghost text-xs">
                            {selectedIds.length === items.length ? 'Снять выбор' : 'Выбрать все'}
                        </button>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={removeBatch}
                                className="btn-primary text-xs"
                                style={{
                                    background: 'var(--color-accent-rose)',
                                    color: 'white',
                                }}
                            >
                                Удалить выбранные ({selectedIds.length})
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:shadow-sm transition-shadow"
                            >
                                <StyledCheckbox
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => toggleItem(item.id)}
                                />
                                <span className="text-main text-sm truncate">{getName(item)}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
