import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Only log full details in development
        if (import.meta.env.DEV) {
            console.error("Uncaught error:", error, errorInfo);
        }
    }

    public render() {
        if (this.state.hasError) {
            const isDev = import.meta.env.DEV;

            return (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f172a] p-6 text-white">
                    <i className="ri-error-warning-line text-5xl text-yellow-400 mb-4" />
                    <h1 className="text-xl font-bold mb-2">Algo deu errado</h1>
                    <p className="text-sm text-white/60 text-center mb-6 max-w-xs">
                        Ocorreu um erro inesperado. Por favor, recarregue o app para continuar.
                    </p>

                    {/* Only show technical details in development */}
                    {isDev && this.state.error && (
                        <pre className="text-xs text-red-400 bg-white/5 p-3 rounded-lg mb-4 max-w-full overflow-x-auto max-h-32 w-full">
                            {this.state.error.toString()}
                        </pre>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                        Recarregar App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
