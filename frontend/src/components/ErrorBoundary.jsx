import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary — Catches rendering errors and displays a graceful fallback.
 * Prevents a single component crash from taking down the entire page.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary]', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '40px 24px',
                        textAlign: 'center',
                        background: 'var(--bd-surface-elevated)',
                        border: '1px solid var(--bd-border-default)',
                        borderRadius: 'var(--bd-radius-2xl)',
                    }}
                    role="alert"
                >
                    <AlertTriangle
                        size={28}
                        style={{ color: 'var(--bd-warning)', opacity: 0.7 }}
                    />
                    <div>
                        <p style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--bd-text-primary)',
                            margin: '0 0 4px',
                        }}>
                            Something went wrong
                        </p>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--bd-text-muted)',
                            margin: 0,
                        }}>
                            {this.props.label || 'This section encountered an error.'}
                        </p>
                    </div>
                    <button
                        onClick={this.handleReset}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 16px',
                            borderRadius: 'var(--bd-radius-lg)',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: 'var(--bd-accent)',
                            background: 'color-mix(in srgb, var(--bd-accent) 8%, transparent)',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshCw size={13} />
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
