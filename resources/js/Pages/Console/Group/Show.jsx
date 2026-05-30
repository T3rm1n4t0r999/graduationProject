// resources/js/Pages/Console/Group/Show.jsx

import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import AssignmentTab from "@/Pages/Console/Group/AssignmentTab.jsx";
import CreateGroupInvitationForm from "@/Pages/Console/Group/CreateGroupInvitationForm.jsx";
import Tooltip from "@/Components/Tooltip.jsx";

function StudentsTab({ group, availableStudents, organization }) {
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleStudent = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const addStudents = () => {
        if (selectedIds.length === 0) return;
        router.post(route('group.student.add', { organization: organization.id, group: group.id }),
            { student_ids: selectedIds },
            { preserveScroll: true, onSuccess: () => setSelectedIds([]) }
        );
    };

    const removeStudent = (studentId) => {
        router.delete(route('group.student.remove', { organization: organization.id, group: group.id, student: studentId }),
            { preserveScroll: true }
        );
    };

    const getInitials = (student) => `${student.lastname?.[0] || ''}${student.firstname?.[0] || ''}`.toUpperCase();

    return (
        <div className="space-y-8">
            {/* Текущие студенты */}
            <div>
                <h3 className="text-base font-semibold text-main mb-4">
                    Текущие студенты ({group.students.data.length})
                </h3>
                <div className="space-y-2">
                    {group.students.data.map(student => (
                        <div
                            key={student.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                                    style={{
                                        background: 'var(--color-primary-light)',
                                        color: 'var(--color-primary)',
                                    }}
                                >
                                    {getInitials(student)}
                                </div>
                                <span className="text-main text-sm font-medium truncate">
                                    {student.lastname} {student.firstname}
                                </span>
                            </div>
                            <button
                                onClick={() => removeStudent(student.id)}
                                className="btn-ghost text-xs flex items-center gap-1"
                                style={{ color: 'var(--color-accent-rose)' }}
                            >
                                × Удалить
                            </button>
                        </div>
                    ))}
                    {group.students.data.length === 0 && (
                        <p className="text-meta text-sm py-4 text-center">Нет студентов</p>
                    )}
                </div>
            </div>

            {/* Добавить студентов */}
            <div>
                <h3 className="text-base font-semibold text-main mb-4">
                    Добавить студентов
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {availableStudents.data.map(student => {
                        const isSelected = selectedIds.includes(student.id);
                        return (
                            <label
                                key={student.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    isSelected
                                        ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700'
                                        : 'border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleStudent(student.id)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-main text-sm truncate">{student.lastname} {student.firstname}</span>
                                {isSelected && (
                                    <span className="ml-auto text-indigo-600 text-sm">✓</span>
                                )}
                            </label>
                        );
                    })}
                    {availableStudents.data.length === 0 && (
                        <p className="text-meta text-sm py-4 text-center">Нет доступных студентов</p>
                    )}
                </div>
                <button
                    onClick={addStudents}
                    disabled={selectedIds.length === 0}
                    className="btn-primary mt-4 flex items-center gap-2"
                >
                    + Добавить выбранных
                </button>
            </div>
        </div>
    );
}

export default function Show({ auth, organization, group, availableStudents, availableCourses, availableHomeworks, availableExams }) {
    const [activeTab, setActiveTab] = useState('students');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isHintVisible, setIsHintVisible] = useState(false);
    const tabs = {
        students: {
            label: 'Студенты',
            content: <StudentsTab group={group} availableStudents={availableStudents} organization={organization} />
        },
        courses: {
            label: 'Курсы',
            content: (
                <AssignmentTab
                    group={group}
                    assignedItems={group.courses}
                    availableItems={availableCourses}
                    itemKey="course_id"
                    itemNameKey="course.title"
                    removeRoute="group.course.remove"
                    assignRoute="group.course.assign"
                    organization={organization}
                    typeLabel="К"
                />
            )
        },
        homeworks: {
            label: 'Домашние задания',
            content: (
                <AssignmentTab
                    group={group}
                    assignedItems={group.homeworks}
                    availableItems={availableHomeworks}
                    itemKey="homework_id"
                    itemNameKey="homework.title"
                    removeRoute="group.homework.remove"
                    assignRoute="group.homework.assign"
                    organization={organization}
                    typeLabel="Д"
                    hint="Домашние задания назначаются студентам автоматически после прохождения всех заданий урока, к которому они привязаны."
                />
            )
        },
        exams: {
            label: 'Контрольные',
            content: (
                <AssignmentTab
                    group={group}
                    assignedItems={group.exams}
                    availableItems={availableExams}
                    itemKey="exam_id"
                    itemNameKey="exam.title"
                    removeRoute="group.exam.remove"
                    assignRoute="group.exam.assign"
                    organization={organization}
                    typeLabel="Р"
                    hint="Контрольные работы назначаются автоматически после завершения всех уроков модуля."
                />
            )
        }
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                {/* Заголовок (без эмодзи) */}
                <div className="glass-card p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-main truncate">{group.name}</h1>
                            <p className="text-meta mt-1">
                                {group.specialty || 'Специальность не указана'}
                            </p>
                            {group.code && (
                                <div>
                                    <span className="text-meta">Код:</span>
                                    <span className="font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400 select-all">
                                        {group.code}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="inline-flex items-center self-start gap-2">
                            <Tooltip content={
                                <>
                                    <div className="flex items-start gap-2 mb-2">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Студентов можно пригласить двумя способами:</span>
                                    </div>
                                    <ol className="list-decimal pl-5 space-y-1.5 text-meta">
                                        <li>
                                            <strong className="text-main">По ссылке на почту</strong><br />
                                            <span className="text-xs">Отправьте приглашение через эту форму.</span>
                                        </li>
                                        <li>
                                            <strong className="text-main">По коду группы</strong><br />
                                            <span className="text-xs">Студент вводит код группы в боте командой <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">/join</code>.</span>
                                        </li>
                                    </ol>
                                </>
                            }>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-400 hover:text-gray-600 hover:border-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-400 cursor-help text-xs font-bold transition-colors"
                                >
                                    ?
                                </button>
                            </Tooltip>
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="btn-primary text-sm ml-2"
                            >
                                + Приглашение
                            </button>
                            <Link
                                href={route('group.index', { organization: organization.id })}
                                className="btn-ghost text-sm ml-2"
                            >
                                ← К списку групп
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Табы */}
                <div className="glass-card p-6 md:p-8">
                    <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        {Object.entries(tabs).map(([key, tab]) => {
                            const count = {
                                students: group.students?.data?.length ?? 0,
                                courses: group.courses?.data?.length ?? 0,
                                homeworks: group.homeworks?.data?.length ?? 0,
                                exams: group.exams?.data?.length ?? 0,
                            }[key];

                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                                        activeTab === key
                                            ? 'border-b-2'
                                            : 'border-b-2 border-transparent text-meta hover:text-main'
                                    }`}
                                    style={{
                                        color: activeTab === key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                        borderColor: activeTab === key ? 'var(--color-primary)' : 'transparent',
                                    }}
                                >
                                    {tab.label}
                                    <span
                                        className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-xs font-medium"
                                        style={{
                                            background: activeTab === key
                                                ? 'var(--color-primary-light)'
                                                : 'var(--color-bg)',
                                            color: activeTab === key
                                                ? 'var(--color-primary)'
                                                : 'var(--color-text-secondary)',
                                        }}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-2">
                        {tabs[activeTab].content}
                    </div>
                </div>
            </div>

            <CreateGroupInvitationForm
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                organization={organization}
                group={group}
                onSuccess={() => {
                    setIsInviteModalOpen(false);
                    router.reload({ only: ['group'], preserveScroll: true });
                }}
            />
        </ConsoleLayout>
    );
}
