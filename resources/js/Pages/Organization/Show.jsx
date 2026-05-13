import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { DEFAULT_STATUS, ORGANIZATION_STATUS } from "@/Constants/OrganizationStatus.jsx";
import { useState } from "react";
import CreateBotForm from "@/Pages/Bot/CreateBotForm.jsx";
import Pagination from "@/Components/Pagination.jsx";
import CreateInvitationForm from "@/Pages/Invitation/CreateInvitationForm.jsx";
import InvitationsListModal from "@/Pages/Invitation/InvitationsListModal.jsx";
import EditOrganizationForm from "@/Pages/Organization/EditOrganizationForm.jsx";

export default function Show({ organization, users, bot, invitations, isVerified }) {
    const statusConfig = ORGANIZATION_STATUS[organization.status] || DEFAULT_STATUS;
    const { can } = usePage().props;
    const restrictionMessage = 'Подтвердите почту организации, чтобы активировать эту функцию';

    const [isCreateBotModalOpen, setIsCreateBotModalOpen] = useState(false);
    const [isCreateInvitationModalOpen, setIsCreateInvitationModalOpen] = useState(false);
    const [isInvitationListModalOpen, setIsInvitationListModalOpen] = useState(false);
    const [isOrganizationEditModalOpen, setIsOrganizationEditModalOpen] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleBotCreated = () => {
        setIsCreateBotModalOpen(false);
        router.reload({ only: ['bot'], preserveScroll: true });
    };
    const handleOrganizationEdited = () => {
        setIsOrganizationEditModalOpen(false);
        router.reload({ only: ['organization'], preserveScroll: true });
    };
    const handleInvitationCreated = () => {
        setIsCreateInvitationModalOpen(false);
        router.reload({ only: ['invitation'], preserveScroll: true });
    };
    const handleResendVerification = () => {
        router.post(route('organization.resendVerification', { organization }), {}, { preserveScroll: true });
    };
    const handleToggleBotStatus = () => {
        if (!bot) return;
        setIsToggling(true);
        router.post(route('bot.toggle', { bot }), {}, {
            preserveScroll: true,
            onSuccess: () => setIsToggling(false),
            onError: () => setIsToggling(false),
        });
    };

    const isBotActive = bot?.is_active;
    const toggleButtonLabel = isBotActive ? 'Остановить бота' : 'Запустить бота';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    {organization.status === 'pending_verification' && (
                        <div className="mb-6 p-4 rounded-xl border"
                             style={{
                                 background: 'var(--color-primary-light)',
                                 borderColor: 'var(--color-primary)',
                                 color: 'var(--color-text-primary)',
                             }}>
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                <div className="flex-1">
                                    <h3 className="font-medium text-main">Организация не подтверждена</h3>
                                    {can?.verify && <>
                                        <p className="text-sm text-meta mt-1">
                                            Проверьте почту <strong>{organization.email}</strong> и перейдите по ссылке для активации.
                                        </p>
                                        <button onClick={handleResendVerification} className="mt-2 text-sm font-medium underline hover:opacity-80" style={{ color: 'var(--color-primary)' }}>
                                            Отправить письмо повторно
                                        </button>
                                    </>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'var(--color-primary)' }}>
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-main">
                                    {organization.name}
                                    {can?.manage && (
                                        <button className="mx-2 transition-opacity hover:opacity-50" onClick={() => setIsOrganizationEditModalOpen(true)}>
                                            <svg className="w-4 h-4 text-meta" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"/>
                                            </svg>
                                        </button>
                                    )}
                                </h1>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1"
                                      style={{
                                          background: 'var(--color-primary-light)',
                                          color: 'var(--color-primary)',
                                      }}>
                                    <span className={`w-2 h-2 mr-2 rounded-full ${statusConfig.label === 'Active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                    {statusConfig.label}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <a
                                href={isVerified ? route('organization.console', organization) : '#'}
                                onClick={(e) => !isVerified && e.preventDefault()}
                                disabled={!isVerified}
                                className={`btn-primary ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}
                                title={!isVerified ? restrictionMessage : ''}
                            >
                                Контент
                            </a>

                            {can?.manage && (bot ? (
                                <button
                                    onClick={handleToggleBotStatus}
                                    disabled={isToggling}
                                    className={`btn-primary ${isToggling ? 'opacity-70' : ''}`}
                                    style={{background: isBotActive ? 'var(--color-error)' : 'var(--color-primary)'}}
                                >
                                    {isToggling ? (
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                    ) : (
                                        <>
                                            {isBotActive ? (
                                                <svg className="w-5 h-5 pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-5 pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                            )}
                                            {toggleButtonLabel}
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => isVerified && setIsCreateBotModalOpen(true)}
                                    disabled={!isVerified}
                                    className={`btn-primary ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}
                                    title={!isVerified ? restrictionMessage : ''}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                    </svg>
                                    Создать бота
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={organization.name} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

                    <div className="glass-card overflow-hidden">
                        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: 'var(--color-primary-light)' }}>
                                        <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-main">Пользователи</h2>
                                        <p className="text-sm text-meta">{users.meta?.total || users.data.length} всего</p>
                                    </div>
                                </div>

                                {can?.invite && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setIsCreateInvitationModalOpen(true)} className="btn-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                                        </button>
                                        <button onClick={() => setIsInvitationListModalOpen(true)} className="btn-ghost">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr style={{ background: 'var(--color-bg-card)' }}>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-meta uppercase">Имя</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-meta uppercase">Роль</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-meta uppercase">Статус</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-meta uppercase">Вступил</th>
                                </tr>
                                </thead>
                                <tbody style={{ borderColor: 'var(--color-border)' }}>
                                {users.data.map((user) => (
                                    <tr key={user.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b"
                                        style={{ borderColor: 'var(--color-border)' }}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: 'var(--color-primary)' }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-main">{user.name}</div>
                                                    <div className="text-sm text-meta">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                                      style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                                    {user.role}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                                                      style={{
                                                          background: user.is_active ? 'var(--color-success)' : 'var(--color-error)',
                                                          color: 'white',
                                                      }}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                                    {user.is_active ? 'Активен' : 'Не активен'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-meta">{user.joined_at}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {users.data.length === 0 && (
                                <div className="px-6 py-12 text-center text-meta">
                                    В организации пока нет пользователей
                                </div>
                            )}
                        </div>
                        {users.meta?.last_page > 1 && (
                            <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                <Pagination links={users.links} meta={users.meta} />
                            </div>
                        )}
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: 'var(--color-primary-light)' }}>
                                    <svg className="w-6 h-6" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-main">Бот организации</h2>
                                    {bot && <p className="text-sm text-meta">Управление ботом</p>}
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {bot ? (
                                <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl border"
                                     style={{
                                         background: 'var(--color-bg-card)',
                                         borderColor: 'var(--color-border)',
                                     }}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-14 h-14 rounded-xl" style={{ background: 'var(--color-primary)' }}>
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-main">{bot.name}</h3>
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
                                                  style={{
                                                      background: bot.is_active ? 'var(--color-success)' : 'var(--color-error)',
                                                      color: 'white',
                                                  }}>
                                                <span className="w-2 h-2 mr-2 rounded-full bg-white animate-pulse"></span>
                                                {bot.is_active ? 'Активен' : 'Не активен'}
                                            </span>
                                        </div>
                                    </div>
                                    {can.manage && (
                                        <Link href={route('bot.edit', bot.id)} className="btn-primary">
                                            <svg className="w-6 h-5 pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                            </svg>
                                            Редактировать
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full" style={{ background: 'var(--color-border-light)' }}>
                                        <svg className="w-8 h-8 text-meta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-main mb-2">Бот не создан</h3>
                                    <p className="text-meta mb-6">Создайте своего первого бота для обучения сотрудников через Telegram</p>
                                    {can?.manage && (
                                        <button
                                            onClick={() => isVerified && setIsCreateBotModalOpen(true)}
                                            disabled={!isVerified}
                                            className={`btn-primary ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}
                                            title={!isVerified ? restrictionMessage : ''}
                                        >
                                            Создать бота
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <EditOrganizationForm
                isOpen={isOrganizationEditModalOpen}
                onClose={() => setIsOrganizationEditModalOpen(false)}
                organization={organization}
                onSuccess={handleOrganizationEdited}
            />

            <CreateInvitationForm
                isOpen={isCreateInvitationModalOpen}
                onClose={() => setIsCreateInvitationModalOpen(false)}
                organizationId={organization.id}
                onSuccess={handleInvitationCreated}
            />

            <InvitationsListModal
                isOpen={isInvitationListModalOpen}
                onClose={() => setIsInvitationListModalOpen(false)}
                invitations={invitations.data}
            />

            <CreateBotForm
                isOpen={isCreateBotModalOpen}
                onClose={() => setIsCreateBotModalOpen(false)}
                organizationId={organization.id}
                onSuccess={handleBotCreated}
            />
        </AuthenticatedLayout>
    );
}
