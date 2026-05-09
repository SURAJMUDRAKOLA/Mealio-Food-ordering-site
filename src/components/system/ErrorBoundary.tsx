import React from 'react';
import Button from '@/components/ui/Button';
import { captureError } from '@/lib/sentry';

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * ErrorBoundary — catches render-phase errors in the React tree.
 *
 * Reports every caught error to Sentry (production only — no-op in dev).
 * Shows a branded recovery UI instead of a blank white page.
 */
class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Send to Sentry with the React component stack for fast debugging
    captureError(error, {
      componentStack: info.componentStack ?? '',
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mealio-container flex min-h-[60vh] items-center justify-center py-16">
          <div className="max-w-lg rounded-lg border border-gourmet-line bg-gourmet-surface/85 p-6 text-center shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-gourmet-accent">
              Mealio recovered
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-gourmet-cream">
              Something failed to render.
            </h1>
            <p className="mt-3 text-sm leading-6 text-gourmet-muted">
              {this.state.error.message || 'Refresh the page to retry.'}
            </p>
            <p className="mt-2 text-xs text-gourmet-dim">
              This error has been reported automatically.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
