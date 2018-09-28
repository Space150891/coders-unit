import React          from 'react';
import {Container}    from 'flux/utils';
import { withRouter } from 'react-router'
import AuthActions    from 'actions/AuthActions';
import AuthStore      from 'stores/AuthStore';

class Logout extends React.Component {

  constructor(props){
    super(props);
    this.state = AuthStore.getState();
  }

  static getStores() {
    return [AuthStore];
  }

  static calculateState() {
    return AuthStore.getState();
  }

  componentWillMount(){
    AuthActions.logout();
  }

  render() {
    return null;
  }
}

var container = Container.create(Logout);
export default withRouter(container);
