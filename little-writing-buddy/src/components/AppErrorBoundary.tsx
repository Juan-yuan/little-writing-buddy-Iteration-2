import { Component, type ErrorInfo, type ReactNode } from 'react'
import { HttpErrorPage } from '../pages/HttpErrorPage'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

/**
 * Catches unexpected render failures and shows a safe 500 page
 * without leaking stack traces into the UI.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep diagnostics in the console for developers only — never in the UI.
    console.error('Unhandled UI error (details hidden from visitors):', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <HttpErrorPage code={500} />
    }
    return this.props.children
  }
}
