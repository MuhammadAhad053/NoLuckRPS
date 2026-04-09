import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirebaseError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Firebase Error: ${parsed.error} during ${parsed.operationType} on ${parsed.path}`;
            isFirebaseError = true;
            
            if (parsed.error.includes('the client is offline')) {
              errorMessage = "Database connection failed. This usually means the Firebase configuration is incorrect or the database is still being provisioned.";
            }
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-orbitron">
          <div className="w-full max-w-md bg-zinc-900/50 border border-red-500/20 rounded-2xl p-8 backdrop-blur-xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-black italic text-white uppercase mb-4 tracking-tighter">
              System <span className="text-red-500">Failure</span>
            </h2>
            
            <div className="bg-black/40 rounded-xl p-4 mb-8 text-left">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Error Log</p>
              <p className="text-red-400/80 text-sm font-mono break-words leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              Reboot System
            </button>
            
            {isFirebaseError && (
              <p className="mt-6 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                If this persists, please contact support or check your internet connection.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
