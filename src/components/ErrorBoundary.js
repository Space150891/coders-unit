import React from 'react';

class ErrorBoundary extends React.Component {

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(
    // error, info
  ) {
    // Display fallback UI
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return(<div>
        <h3>Something went wrong</h3>
        <span>Please try again later</span>
      </div>);
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
