import React       from 'react';
import {Container} from 'flux/utils';
import AuthActions from 'actions/AuthActions';
import AuthStore   from 'stores/AuthStore';
import Confirm     from 'components/Common/Confirm';
import ThemeVars   from 'theme_vars';
import { FormGroup, ControlLabel, FormControl, Button, Alert } from 'react-bootstrap';
import { browserHistory, Link } from 'react-router';

class LoginForm extends React.Component {

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

  handleClick() {
    var email    = this.emailInputReference.value;
    var password = this.passwordInputReference.value;
    AuthActions.login(email, password);
  }

  componentWillMount(){
    if(AuthStore.isAuthenticated()) browserHistory.push('/');
  }

  render() {

    let isLoading = this.state.isLoading;

    return (
      <div className="login-form">
        <form action="#">
          <h4>Login</h4>
          {this.state.alerts.map((message, key)=> {
            return <Alert key={key} bsStyle={message.level}>
              {message.messageText}
            </Alert>
          })}
          <FormGroup controlId="loginEmail" validationState={this.state.credentialsValidationState}>
            <ControlLabel>Email</ControlLabel>
            <FormControl type="text" disabled={isLoading} inputRef={node => this.emailInputReference = node}/>
          </FormGroup>
          <FormGroup controlId="loginPassword" validationState={this.state.credentialsValidationState}>
            <ControlLabel>Password</ControlLabel>
            <FormControl type="password" disabled={isLoading} inputRef={node => this.passwordInputReference = node}/>
          </FormGroup>
          <Button
            bsStyle="primary"
            className="btn-raised"
            disabled={isLoading}
            onClick={!isLoading ? this.handleClick.bind(this) : null}>
            {isLoading ? 'Loading...' : 'Login'}
          </Button>
          {null === ThemeVars.organizationId ?
            <Confirm
              onConfirm={function(){window.location = 'https://api.imatrix.io/register'}}
              body="You will be redirected to the registration page. Proceed?"
              confirmText="Yes, proceed"
              title="Confirmation required">
              <a href="#" className="btn btn-primary">SIGN UP</a>
            </Confirm>
            :
            <Link to={'/signup'} className="btn btn-primary" activeClassName="active" >SIGN UP</Link>
          }
          <Link to={'/password-reset'} activeClassName="active" >Forgot Password?</Link>
        </form>
      </div>
    );
  }
}

var container = Container.create(LoginForm);
export default container;
