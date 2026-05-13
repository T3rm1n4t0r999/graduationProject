import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CreateMaterialForm from "@/Pages/Console/LessonMaterial/CreateMaterialForm.jsx";

function MaterialCard({ material, organization }) {
    return (
        <Link
            href={route('material.show', {
                organization: organization.id,
                material: material.id,
            })}
            className="glass-card p-6 hover:shadow-md transition-shadow flex flex-col justify-between group"
        >
            <div>
                <h3
                    className="text-lg font-semibold mb-2 group-hover:underline"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {material.title}
                </h3>
            </div>
            <div
                className="mt-4 pt-4 border-t flex items-center justify-between text-xs"
                style={{ borderColor: 'var(--color-border)' }}
            >
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

export default function List({ auth, organization, materials, lessons }) {
    const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState(false);

    const handleMaterialCreated = () => {
        setIsCreateMaterialModalOpen(false);
        router.reload({ only: ['materials'], preserveScroll: true });
    };

    return (
        <ConsoleLayout
            auth={auth}
            organization={organization}
            header={
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Материалы
                </h1>
            }
        >
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <button onClick={() => setIsCreateMaterialModalOpen(true)} className="btn-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Создать материал
                    </button>
                </div>

                {materials.data.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                            Пока нет ни одного материала.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {materials.data.map((material) => (
                            <MaterialCard key={material.id} material={material} organization={organization} />
                        ))}
                    </div>
                )}
            </div>

            <CreateMaterialForm
                isOpen={isCreateMaterialModalOpen}
                onClose={() => setIsCreateMaterialModalOpen(false)}
                organization={organization}
                lessons={lessons.data}
                onSuccess={handleMaterialCreated}
            />
        </ConsoleLayout>
    );
}
