import React, { Component } from 'react';
import { Col }         from 'react-bootstrap';
import ErrorBoundary        from 'components/ErrorBoundary';

class ThingsLayout extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Col xs={12} sm={6} md={8} lg={6} className="content product well">
        <ErrorBoundary>
          {this.props.children}
        </ErrorBoundary>
      </Col>
    );
  }
}

export default ThingsLayout;
