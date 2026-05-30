import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import StyledCheckbox from '@/Components/StyledCheckbox';

export default function AssignModal({
                                        show,
                                        onClose,
                                        title,
                                        items,
                                        onAssign,
                                        actionLabel = 'Назначить'
                                    }) {
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (show) {
            setSelectedIds([]);
        }
    }, [show]);

    const allSelected = items.length > 0 && selectedIds.length === items.length;

    const toggleItem = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(item => item.id));
        }
    };

    const handleAssign = () => {
        if (selectedIds.length === 0) return;
        onAssign(selectedIds);
        onClose();
    };

    if (!show) return null;

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all animate-fade-in">
                                <div className="flex items-center gap-2 mb-4">
                                    <span role="img" aria-label="assign">📋</span>
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-main">
                                        {title}
                                    </Dialog.Title>
                                </div>

                                {items.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleAll}
                                        className="btn-ghost text-sm w-full justify-center mb-4"
                                    >
                                        {allSelected ? '✕ Снять выбор' : '✓ Выбрать все'}
                                    </button>
                                )}

                                <div className="space-y-1 max-h-60 overflow-y-auto">
                                    {items.length === 0 && (
                                        <p className="text-center text-meta py-4">Нет доступных элементов</p>
                                    )}
                                    {items.map(item => (
                                        <label
                                            key={item.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                selectedIds.includes(item.id)
                                                    ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700'
                                                    : 'border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <StyledCheckbox
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => toggleItem(item.id)}
                                            />
                                            <span className="text-main text-sm truncate">{item.title}</span>
                                            {selectedIds.includes(item.id) && (
                                                <span className="ml-auto text-indigo-600 text-sm">✓</span>
                                            )}
                                        </label>
                                    ))}
                                </div>

                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-sm text-meta">
                                        Выбрано: {selectedIds.length}
                                    </span>
                                    <div className="flex gap-3">
                                        <button onClick={onClose} className="btn-ghost">
                                            Отмена
                                        </button>
                                        <button
                                            onClick={handleAssign}
                                            disabled={selectedIds.length === 0}
                                            className="btn-primary"
                                        >
                                            {actionLabel}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </Transition>
    );
}
