'use client'

import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#dc2626',
          color: '#fff',
          borderRadius: '8px',
          margin: '10px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <h3>⚠️ Component Error</h3>
          <p>{this.state.error?.message}</p>
          <details style={{ marginTop: '10px', cursor: 'pointer' }}>
            <summary>Stack trace</summary>
            <pre style={{ 
              marginTop: '5px', 
              backgroundColor: 'rgba(0,0,0,0.3)', 
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
