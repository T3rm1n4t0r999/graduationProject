import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {
    const { invitation } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: invitation?.email || '',
        password: '',
        password_confirmation: '',
        invitation_token: invitation?.token || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Регистрация" />

            {invitation && (
                <div className="mb-4 p-3 rounded-xl border"
                     style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}>
                    <p className="text-sm text-main">
                        Вас пригласили в организацию <strong>{invitation.organizationName}</strong>.
                        Для завершения регистрации придумайте имя и пароль.
                    </p>
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <label className="block text-sm font-medium text-main">Имя*</label>
                    <input
                        type="text"
                        autoFocus
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="form-input-glass mt-1"
                        required
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                {!invitation && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-main">Email*</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="form-input-glass mt-1"
                            required
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                )}

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

                <div className="mt-4">
                    <label className="block text-sm font-medium text-main">Подтверждение пароля</label>
                    <input
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="form-input-glass mt-1"
                        required
                    />
                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>}
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="text-sm text-meta underline hover:text-main transition-colors"
                    >
                        Уже зарегистрированы?
                    </Link>
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
