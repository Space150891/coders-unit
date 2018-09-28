import React, { Component } from 'react';
import ErrorBoundary        from 'components/ErrorBoundary';
import { Col }         from 'react-bootstrap';

class UserLayout extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Col xs={12} sm={6} md={8} lg={6} className="content user well">
        <ErrorBoundary>
          {this.props.children}
        </ErrorBoundary>
      </Col>
    );
  }
}

export default UserLayout;
