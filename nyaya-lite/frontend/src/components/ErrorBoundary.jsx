import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                    <div className="card-premium p-8 max-w-sm border-l-4 border-red-500">
                        <h2 className="text-xl font-bold text-red-600 mb-2 font-['Outfit']">Something went wrong</h2>
                        <p className="text-[var(--text-secondary)] text-sm mb-6">
                            We're sorry, but the application encountered an unexpected error.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-gradient w-full"
                        >
                            Reload Application
                        </button>
                        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left overflow-auto max-h-32 text-red-500 font-mono">
                            {this.state.error && (
                                <>
                                    <div className="font-bold mb-1">{this.state.error.name}: {this.state.error.message}</div>
                                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
