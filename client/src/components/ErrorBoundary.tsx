import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      let errorMessage = 'Something went wrong.';
      try {
        if (error?.message) {
          const parsed = JSON.parse(error.message);
          if (parsed.error) {
            errorMessage = `Firestore Error: ${parsed.error} (${parsed.operationType} on ${parsed.path})`;
          }
        }
      } catch (e) {
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold text-stone-900 mb-4">Application Error</h2>
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-mono break-all">
              {errorMessage}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
