import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, Link, router} from '@inertiajs/react';
import {DEFAULT_STATUS, ORGANIZATION_STATUS} from "@/Constants/OrganizationStatus.jsx";
import {useState} from "react";
import Modal from "@/Components/Modal.jsx";
import CreateBotForm from "@/Pages/Bot/CreateBotForm.jsx";
import Pagination from "@/Components/Pagination.jsx";

export default function Show({organization, users, bots}) {
    const statusConfig = ORGANIZATION_STATUS[organization.status] || DEFAULT_STATUS;
    console.log(organization, users, bots)
    const [isCreateBotModalOpen, setIsCreateBotModalOpen] =
        useState(false);

    const handleBotCreated = () => {
        setIsCreateBotModalOpen(false);
        router.reload({ only: ['organization'], preserveScroll: true });
    };

    const hasUserPages = users?.meta?.last_page > 1;
    const hasBotPages = bots?.meta?.last_page > 1;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold">{organization.name}</h1>
                            <span className={`px-3 py-2 rounded-lg text-sm font-medium ${statusConfig.className}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                    </h2>
                    <div className="flex">
                        <div className="">
                            <button
                                type="button"
                                onClick={() => setIsCreateBotModalOpen(true)}
                                className="bg-blue-500 p-2 ml-2 px-6 rounded-lg text-white shadow transition-all hover:bg-blue-700 hover:text-gray-400"
                            >
                                Create bot
                            </button>
                            <Modal show={isCreateBotModalOpen} onClose={() => setIsCreateBotModalOpen(false)}>
                                <CreateBotForm
                                    organizationId={organization.id}
                                    onSuccess={handleBotCreated}
                                />
                            </Modal>
                        </div>
                        <Link
                            className="bg-blue-500 p-2 ml-2 px-6 rounded-lg text-white shadow transition-all hover:bg-blue-700 hover:text-gray-400"
                            href={route('bot.create', organization)}
                        >
                            Edit
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-900">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="text-center pb-3 uppercase">
                                <span>
                                    Пользователи
                                </span>
                            </div>
                            <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                                        <tr className="text-nowrap">
                                            <th className="px-3 py-3">Имя</th>
                                            <th className="px-3 py-3">Роль</th>
                                            <th className="px-3 py-3">Статус</th>
                                            <th className="px-3 py-3">Вступил</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map(user => (
                                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                key = {user.id}>
                                                <td className="px-3 py-2">
                                                    {user.name}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {user.role}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {user.is_active ? "active" : "not active"}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {user.joined_at}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {hasUserPages && (
                                    <Pagination links={users.links} meta={users.meta} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-900">
                    <div className="p-6 text-gray-900 dark:text-gray-100">

                            {bots.data.length > 0 ? (
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                <div className="text-center pb-3 uppercase">
                                    <span>
                                        БОТЫ
                                    </span>
                                </div>
                                <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b-2 border-gray-500">
                                        <tr className="text-nowrap">
                                            <th className="px-3 py-3">Название</th>
                                            <th className="px-3 py-3">Статус</th>

                                        </tr>
                                        </thead>
                                        <tbody>
                                        {bots.data.map(bot => (
                                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                key = {bot.id}>
                                                <td className="px-3 py-2">
                                                    {bot.name}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {bot.status}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    {hasBotPages && (
                                        <Pagination links={bots.links} meta={bots.meta} />
                                    )}
                                </div>
                            </div>
                            ) :
                                <div className="uppercase text-center">
                                    <span>
                                        У организации нет ботов
                                    </span>
                                </div>
                            }

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
