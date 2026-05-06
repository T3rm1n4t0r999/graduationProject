import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Сброс пароля" />

            <form onSubmit={submit}>
                <div>
                    <label className="block text-sm font-medium text-main">Email</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="form-input-glass mt-1"
                        required
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-main">Новый пароль</label>
                    <input
                        type="password"
                        autoFocus
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

                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Сброс...' : 'Сбросить пароль'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
