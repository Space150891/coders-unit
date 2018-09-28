import React, { Component } from 'react';
import { Col }         from 'react-bootstrap';
import ErrorBoundary        from 'components/ErrorBoundary';

class DashboardLayout extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Col xs={12} sm={6} md={8} lg={6} className="content well dashboard">
        <ErrorBoundary>
          {this.props.children}
        </ErrorBoundary>
      </Col>
    );
  }
}

export default DashboardLayout;

