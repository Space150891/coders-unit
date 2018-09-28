import 'normalize.css/normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/App.less';
import { Row, Col } from 'react-bootstrap';
import ErrorBoundary from 'components/ErrorBoundary';
import Navigator from 'components/Dashboard/Navigator/Navigator';

import React, { Component } from 'react';
import Header from './Header';

class AppComponent extends Component {

  componentWillMount() {
    this.lock = false;
  }

  render() {
    return (
      <div>
        <Header lock={this.lock}></Header>
        <div className="container-fluid">
          <Row>
            <Col xs={12} sm={6} md={4} lg={3} className="sidebar">
              <ErrorBoundary>
                <Navigator/>
              </ErrorBoundary>
            </Col>
            {this.props.children}
            <Col xs={12} sm={0} md={0} lg={3}>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default AppComponent;
