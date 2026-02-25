import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

interface RootErrorBoundaryState {
  hasError: boolean;
}

export class RootErrorBoundary extends Component<PropsWithChildren, RootErrorBoundaryState> {
  public override state: RootErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled application error.', error, errorInfo);
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return <div>Unexpected error occurred. Please reload the page.</div>;
    }

    return this.props.children;
  }
}
