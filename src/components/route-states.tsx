/**
 * Shared route-level production states: loading skeleton, error boundary UI,
 * and a screen-level error boundary so one broken module can't blank the app.
 */
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function RoutePending() {
  return (
    <div className="min-h-dvh bg-background p-6" role="status" aria-live="polite">
      <span className="sr-only">Loading console…</span>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function RouteError({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" aria-hidden="true" />
        <h1 className="mt-4 text-lg font-semibold text-foreground">This console didn't load</h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => (reset ? reset() : window.location.reload())}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Go home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface BoundaryState {
  error: Error | null;
}

/** Isolates a single dashboard module so its failure doesn't unmount the shell. */
export class ScreenErrorBoundary extends React.Component<
  { children: React.ReactNode; screenId?: string },
  BoundaryState
> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  override componentDidUpdate(prevProps: { screenId?: string }) {
    if (prevProps.screenId !== this.props.screenId && this.state.error) {
      this.setState({ error: null });
    }
  }

  override render() {
    if (this.state.error) {
      return (
        <div
          className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center"
          role="alert"
        >
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            This module failed to render.
          </p>
          <p className="mt-1 break-words text-xs text-muted-foreground">
            {this.state.error.message}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => this.setState({ error: null })}
          >
            Retry module
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ScreenPending() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">Loading module…</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}
