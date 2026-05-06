import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Вход" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <label className="block text-sm font-medium text-main">Email</label>
                    <input
                        type="email"
                        autoFocus
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="form-input-glass mt-1"
                        required
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-main">Пароль</label>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="form-input-glass mt-1"
                        required
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="mt-4 flex items-center">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label className="ml-2 text-sm text-meta">Запомнить меня</label>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-meta underline hover:text-main transition-colors"
                        >
                            Забыли пароль?
                        </Link>
                    )}
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Вход...' : 'Войти'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
