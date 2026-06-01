import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function AssignmentTab({
                                          group,
                                          assignedItems,
                                          availableItems,
                                          itemKey,
                                          itemNameKey,
                                          removeRoute,
                                          assignRoute,
                                          organization,
                                          typeLabel = '',
                                          hint = '',                                 // <-- новый проп
                                      }) {
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleItem = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const assignItems = () => {
        if (selectedIds.length === 0) return;
        router.post(
            route(assignRoute, { organization: organization.id, group: group.id }),
            { [itemKey.replace('_id', '') + '_ids']: selectedIds },
            { preserveScroll: true, onSuccess: () => setSelectedIds([]) }
        );
    };

    const paramNameMap = {
        course_id: 'groupCourse',
        homework_id: 'groupHomework',
        exam_id: 'groupExam',
    };

    const removeItem = (assignmentId) => {
        const paramName = paramNameMap[itemKey] || itemKey;
        router.delete(
            route(removeRoute, {
                organization: organization.id,
                group: group.id,
                [paramName]: assignmentId,
            }),
            { preserveScroll: true }
        );
    };

    const getName = (item) => {
        const keys = itemNameKey.split('.');
        let value = item;
        keys.forEach(k => {
            value = value?.[k];
        });
        return value || 'Без названия';
    };

    return (
        <div className="space-y-8">
            {/* Подсказка (если передана) */}
            {hint && (
                <div
                    className="flex items-start gap-3 p-4 rounded-xl border"
                    style={{
                        background: 'var(--color-primary-light)',
                        borderColor: 'var(--color-primary)',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
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

            {/* Назначенные элементы */}
            <div>
                <h3 className="text-base font-semibold text-main mb-4">
                    Назначенные
                </h3>
                {assignedItems.length === 0 ? (
                    <p className="text-meta text-center py-6">Ничего не назначено</p>
                ) : (
                    <div className="space-y-2">
                        {assignedItems.map(assigned => (
                            <div
                                key={assigned.id}
                                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {typeLabel && (
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-meta flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                            {typeLabel}
                                        </div>
                                    )}
                                    <span className="text-main text-sm font-medium truncate">{getName(assigned)}</span>
                                </div>
                                <button
                                    onClick={() => removeItem(assigned.id)}
                                    className="btn-ghost text-xs flex items-center gap-1 flex-shrink-0 ml-2"
                                    style={{ color: 'var(--color-accent-rose)' }}
                                >
                                    × Удалить
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Форма добавления */}
            <div>
                <h3 className="text-base font-semibold text-main mb-4">
                    Добавить
                </h3>
                {availableItems.data.length === 0 ? (
                    <p className="text-meta text-center py-6">Нет доступных элементов</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {availableItems.data.map(item => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                                <label
                                    key={item.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700'
                                            : 'border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleItem(item.id)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-main text-sm">{item.title}</span>
                                    {isSelected && (
                                        <span className="ml-auto text-indigo-600 text-sm">✓</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                )}
                <button
                    onClick={assignItems}
                    disabled={selectedIds.length === 0}
                    className="btn-primary mt-4 flex items-center gap-2"
                >
                    + Назначить выбранное
                </button>
            </div>
        </div>
    );
}
