import React, { Component } from 'react';

class AuthLayout extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="auth container">
        <div className="auth-block well">
          <div className="logo"></div>
          {this.props.children}
          <div className="powered-by">Powered By iMatrix</div>
        </div>
      </div>
    );
  }
}

export default AuthLayout;
