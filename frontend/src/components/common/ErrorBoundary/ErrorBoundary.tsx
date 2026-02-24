import { Component, type ReactNode, type ErrorInfo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--bn-text-muted)',
        }}>
          <FontAwesomeIcon 
            icon={faCircleExclamation} 
            style={{ width: '64px', height: '64px', marginBottom: '1rem', opacity: 0.5 }}
          />
          <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '1.5rem' }}>An unexpected error occurred.</p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.625rem 1.5rem',
              background: 'var(--bn-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--bn-radius-sm)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
