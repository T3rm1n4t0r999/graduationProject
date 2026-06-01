import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Dashboard Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="glass-card p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                         style={{ background: 'var(--color-accent-rose-light)', color: 'var(--color-accent-rose)' }}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <h3 className="font-semibold text-main mb-1">Что-то пошло не так</h3>
                    <p className="text-sm text-meta mb-3">Не удалось загрузить виджет</p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="btn-ghost text-sm"
                    >
                        Попробовать снова
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
