import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('💥 App Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex',
          flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>💥</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 24, marginBottom: 12 }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: 28, maxWidth: 320 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 28px' }}
            onClick={() => window.location.href = '/'}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}