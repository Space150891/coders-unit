import React          from 'react';
import { Row, Col }   from 'react-bootstrap';
import ErrorBoundary  from 'components/ErrorBoundary';
import Navigator      from 'components/Platforms/Navigator/Navigator';

class PlatformsLayout extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Row>
        <Col xs={12} sm={6} md={4} lg={3} className="sidebar">
          <ErrorBoundary>
            <Navigator/>
          </ErrorBoundary>
        </Col>
        <Col xs={12} sm={6} md={8} lg={6} className="content platform well">
          <ErrorBoundary>
            {this.props.children}
          </ErrorBoundary>
        </Col>
        <Col xs={12} sm={0} md={0} lg={3}>
        </Col>
      </Row>
    );
  }
}

export default PlatformsLayout;
