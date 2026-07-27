import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <span className="text-5xl mb-4">⚠️</span>
          <h2 className="text-lg font-bold text-[var(--color-text)]">Something went wrong</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}