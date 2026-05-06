import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Восстановление пароля" />

            <p className="mb-4 text-sm text-meta">
                Забыли пароль? Укажите ваш email, и мы отправим ссылку для сброса пароля.
            </p>

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

                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Отправка...' : 'Отправить ссылку'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
