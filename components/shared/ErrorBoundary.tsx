import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Class-only by React's design — there is no hook equivalent for catching render
// errors (getDerivedStateFromError/componentDidCatch). Wraps page content in
// LayoutDefault so a render-time throw anywhere in a page shows this fallback
// instead of unmounting the entire app (nav, banners, everything).
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            An unexpected error occurred. Reloading the page usually fixes this.
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
