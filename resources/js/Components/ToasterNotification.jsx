// resources/js/Components/ToasterNotification.jsx
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

export default function ToasterNotification() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const html = document.documentElement;
        const updateTheme = () => {
            setTheme(html.classList.contains('dark') ? 'dark' : 'light');
        };
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(html, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const toastStyle = {
        background: 'var(--color-bg-card)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
    };

    return (
        <Toaster
            position="top-right"
            theme={theme}
            toastOptions={{
                className: 'glass-toast',
                style: toastStyle,
                success: {
                    style: {
                        borderColor: 'var(--color-success)',
                    },
                    iconTheme: {
                        primary: 'var(--color-success)',
                        secondary: 'white',
                    },
                },
                error: {
                    style: {
                        borderColor: 'var(--color-error)',
                    },
                    iconTheme: {
                        primary: 'var(--color-error)',
                        secondary: 'white',
                    },
                },
                warning: {
                    style: {
                        borderColor: 'var(--color-warning)',
                    },
                    iconTheme: {
                        primary: 'var(--color-warning)',
                        secondary: 'white',
                    },
                },
                info: {
                    style: {
                        borderColor: 'var(--color-primary)',
                    },
                    iconTheme: {
                        primary: 'var(--color-primary)',
                        secondary: 'white',
                    },
                },
            }}
        />
    );
}
