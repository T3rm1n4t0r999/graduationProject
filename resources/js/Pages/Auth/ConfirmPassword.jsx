import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Подтверждение пароля" />

            <p className="mb-4 text-sm text-meta">
                Это защищённая область приложения. Пожалуйста, подтвердите ваш пароль для продолжения.
            </p>

            <form onSubmit={submit}>
                <div>
                    <label className="block text-sm font-medium text-main">Пароль</label>
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

                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Подтверждение...' : 'Подтвердить'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
