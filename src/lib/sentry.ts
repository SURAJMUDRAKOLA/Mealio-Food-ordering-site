import * as Sentry from '@sentry/react';

/**
 * initSentry — initialises Sentry error monitoring.
 *
 * Only activates in production builds (import.meta.env.PROD).
 * In local dev the SDK is a silent no-op, so there is zero overhead.
 *
 * Required env var (add to .env and to GitHub Secrets):
 *   VITE_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
 *
 * Source map upload is handled by @sentry/vite-plugin in vite.config.ts.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Skip entirely in development or when DSN is not configured
  if (!import.meta.env.PROD || !dsn) return;

  Sentry.init({
    dsn,
    // Capture 10% of transactions for performance tracing (adjust in prod)
    tracesSampleRate: 0.1,
    // Capture 100% of replays where an error occurred
    replaysOnErrorSampleRate: 1.0,
    // Capture 5% of regular replays for UX insights
    replaysSessionSampleRate: 0.05,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text and block all media by default (GDPR safe)
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Tag every event with the build environment
    environment: import.meta.env.MODE,
  });
}

/** Captures an error with optional extra context — use in catch blocks */
export const captureError = (err: unknown, context?: Record<string, unknown>) => {
  if (!import.meta.env.PROD) return;
  Sentry.captureException(err, context ? { extra: context } : undefined);
};

// Re-export Sentry's ErrorBoundary for convenient use in components
export { Sentry };
