import ConsoleLayout from '@/Layouts/ConsoleLayout';

export default function Index({ auth, organization }) {
    return (
        <ConsoleLayout auth={auth} organization={organization}>
            <div className="glass-card p-6">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Консоль {organization.name}
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Здесь будет панель управления учебными материалами.
                </p>
            </div>
        </ConsoleLayout>
    );
}
