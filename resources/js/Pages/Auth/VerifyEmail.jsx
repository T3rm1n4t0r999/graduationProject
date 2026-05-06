import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Подтверждение Email" />

            <div className="mb-4 text-sm text-meta">
                Спасибо за регистрацию! Прежде чем начать, подтвердите ваш email,
                перейдя по ссылке в отправленном письме. Если вы не получили письмо,
                нажмите кнопку ниже, чтобы отправить повторно.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                    Новая ссылка для подтверждения отправлена на ваш email.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Отправка...' : 'Отправить повторно'}
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="btn-ghost text-sm"
                    >
                        Выйти
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
