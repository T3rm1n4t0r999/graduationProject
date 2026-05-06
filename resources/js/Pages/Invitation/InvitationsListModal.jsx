// resources/js/Pages/Invitation/InvitationsListModal.jsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from '@inertiajs/react';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        expired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    const labels = {
        pending: 'Ожидает',
        accepted: 'Принято',
        expired: 'Истекло',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
};

const UserBadge = ({ type }) => {
    const labels = {
        teacher: 'Учитель',
        manager: 'Менеджер',
        student: 'Ученик',
    };

    return (
        <span className="badge" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            {labels[type] || type}
        </span>
    );
};

export default function InvitationsListModal({ isOpen, onClose, invitations = [] }) {
    const { delete: destroyMethod } = useForm();

    const handleDelete = (invitationId) => {
        if (!confirm('Вы уверены, что хотите отозвать это приглашение?')) return;
        destroyMethod(route('invitation.destroy', invitationId), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
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
                    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl glass-card p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium text-main mb-4 flex justify-between items-center">
                                    <span>История приглашений</span>
                                    <button onClick={onClose} className="text-meta hover:text-main">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </Dialog.Title>

                                <div className="mt-2">
                                    {invitations.length === 0 ? (
                                        <div className="text-center py-10 text-meta">
                                            <svg className="mx-auto h-12 w-12 text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <p className="mt-2">Приглашений пока нет</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                <tr style={{ background: 'var(--color-bg-card)' }}>
                                                    <th className="text-left text-xs font-semibold text-meta uppercase py-3.5 pl-4 pr-3 sm:pl-6">Email</th>
                                                    <th className="text-left text-xs font-semibold text-meta uppercase px-3 py-3.5">Роль</th>
                                                    <th className="text-left text-xs font-semibold text-meta uppercase px-3 py-3.5">Статус</th>
                                                    <th className="text-left text-xs font-semibold text-meta uppercase px-3 py-3.5">Дата принятия</th>
                                                    <th className="text-left text-xs font-semibold text-meta uppercase px-3 py-3.5">Дата отправки</th>
                                                    <th className="text-left text-xs font-semibold text-meta uppercase px-3 py-3.5">Дата истечения</th>
                                                    <th className="text-left text-xs font-semibold text-meta uppercase px-3 py-3.5">Действие</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                                {invitations.map((inv) => (
                                                    <tr key={inv.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-main sm:pl-6">{inv.email}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <UserBadge type={inv.type} />
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <StatusBadge status={inv.status} />
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-meta">{inv.accepted_at || '---'}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-meta">{inv.created_at}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-meta">{inv.expires_at}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(inv.id)}
                                                                disabled={inv.status !== 'pending'}
                                                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Отозвать приглашение"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                                </svg>
                                                                <span className="sr-only">Удалить</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="btn-ghost"
                                    >
                                        Закрыть
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
