import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import CreateMaterialForm from "@/Pages/Console/LessonMaterial/CreateMaterialForm.jsx";
import MaterialCard from "@/Pages/Console/LessonMaterial/MaterialCard.jsx";
import Pagination from "@/Components/Pagination.jsx"; // ✅ Добавлена пагинация

export default function List({ auth, organization, materials, lessons }) {
    const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState(false);

    const handleMaterialCreated = () => {
        setIsCreateMaterialModalOpen(false);
        router.reload({ only: ['materials'], preserveScroll: true });
    };

    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Заголовок */}
                <div className="glass-card p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'var(--color-accent-sky-light)', color: 'var(--color-accent-sky)' }}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-main">Материалы</h1>
                                <p className="text-meta mt-1">
                                    Всего: <span className="font-semibold text-main">{materials.total ?? 0}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsCreateMaterialModalOpen(true)} className="btn-primary flex items-center gap-2">
                            + Создать материал
                        </button>
                    </div>
                </div>

                {/* Список материалов с пагинацией */}
                {materials.data.length === 0 ? (
                    <div className="glass-card p-12 text-center text-meta">
                        Пока нет ни одного материала.
                    </div>
                ) : (
                    <div className="glass-card p-6 md:p-8">
                        {/* ✅ Grid ОТДЕЛЬНО */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {materials.data.map((material) => (
                                <MaterialCard key={material.id} material={material} organization={organization} />
                            ))}
                        </div>

                        {/* ✅ Пагинация ПОСЛЕ grid */}
                        <Pagination meta={materials.meta} links={materials.links} />
                    </div>
                )}
            </div>

            <CreateMaterialForm
                isOpen={isCreateMaterialModalOpen}
                onClose={() => setIsCreateMaterialModalOpen(false)}
                organization={organization}
                lessons={lessons}
                onSuccess={handleMaterialCreated}
            />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.5s ease-out; }
            `}</style>
        </ConsoleLayout>
    );
}
