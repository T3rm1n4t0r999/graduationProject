import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import CreateCourseForm from '@/Pages/Console/Course/CreateCourseForm';
import SortableCourses from '@/Pages/Console/Course/SortableCourses';

export default function List({ auth, organization, courses }) {
    const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);

    const handleCourseCreated = () => {
        setIsCreateCourseModalOpen(false);
        router.reload({ only: ['courses'], preserveScroll: true });
    };

    const handleSaveOrder = async (orderedItems) => {
        return new Promise((resolve, reject) => {
            router.patch(
                route('course.reorder', { organization: organization.id }),
                { items: orderedItems },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ['courses'], preserveScroll: true });
                        resolve();
                    },
                    onError: (error) => reject(error),
                }
            );
        });
    };

    return (
        <ConsoleLayout
            auth={auth}
            organization={organization}
            header={
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Курсы
                </h1>
            }
        >
            <div className="max-w-6xl mx-auto">
                {/* Кнопка создания курса */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => setIsCreateCourseModalOpen(true)}
                        className="btn-primary"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Создать курс
                    </button>
                </div>

                {/* SortableCourses сам управляет списком, кнопками изменения порядка и сохранением */}
                <SortableCourses
                    organization={organization}
                    courses={courses.data}
                    onSaveOrder={handleSaveOrder}
                />
            </div>

            <CreateCourseForm
                isOpen={isCreateCourseModalOpen}
                onClose={() => setIsCreateCourseModalOpen(false)}
                organization={organization}
                onSuccess={handleCourseCreated}
            />
        </ConsoleLayout>
    );
}
