import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border border-red-100">
                        <h2 className="text-2xl font-bold text-red-600 mb-4 font-['Outfit']">Something went wrong</h2>
                        <div className="bg-red-50 p-4 rounded-lg mb-6">
                            <p className="text-red-800 text-sm font-mono whitespace-pre-wrap break-words">
                                {this.state.error && this.state.error.toString()}
                            </p>
                        </div>
                        <p className="text-gray-600 mb-6">
                            A serious error occurred in the application. Please refresh the page or try again later.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
