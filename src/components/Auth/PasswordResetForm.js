import _                      from 'lodash';
import React                  from 'react';
import {Container}            from 'flux/utils';
import PasswordResetActions   from 'actions/PasswordResetActions';
import PasswordResetStore     from 'stores/PasswordResetStore';
import AuthStore              from 'stores/AuthStore';
import PwMeter                from 'components/Common/PwMeter';
import { FormGroup, ControlLabel, FormControl, Button, Alert } from 'react-bootstrap';
import { Link, browserHistory } from 'react-router';

class PasswordResetForm extends React.Component {

  constructor(props){
    super(props);
    this.state = PasswordResetStore.getState();
  }

  static getStores() {
    return [PasswordResetStore];
  }

  static calculateState() {
    return PasswordResetStore.getState();
  }

  handleChange(event){
    const elementName = event.target.id;
    const oldValue    = this.state[event.target.id];
    const newValue    = event.target.value;
    PasswordResetActions.formValueChange(elementName, oldValue, newValue);
  }

  handlePasswordChange(event){
    const elementName = 'plainPassword';
    const oldValue    = this.state.passwordResetSubmission.get(elementName) || null;
    const newValue    = Object.assign({}, oldValue);
    newValue[event.target.id] = event.target.value;
    PasswordResetActions.formValueChange(elementName, oldValue, newValue);
  }

  renderInputValidationAlerts(inputName){
    return _.get(this.state, ['inputsValidity', inputName, 'messages'], []).map((message, key)=> {
      return <Alert key={key} bsStyle="info">
        {message}
      </Alert>
    })
  }

  componentWillMount(){
    if(AuthStore.isAuthenticated()) browserHistory.push('/');
  }

  getInputsContent(){

    let isLoading = this.state.isLoading;

    if(this.props.params.token){
      return(
        <div>
          <FormGroup controlId="first" validationState={_.get(this.state, ['inputsValidity', 'first', 'status'], null)}>
            <ControlLabel>Password</ControlLabel>
            <PwMeter value={this.state.passwordResetSubmission.get('plainPassword')['first'] || ''} disabled={isLoading} onChange={this.handlePasswordChange.bind(this)}/>
            {this.renderInputValidationAlerts('first')}
          </FormGroup>
          <FormGroup controlId="second" validationState={_.get(this.state, ['inputsValidity', 'second', 'status'], null)}>
            <ControlLabel>Re-Enter Password</ControlLabel>
            <FormControl value={this.state.passwordResetSubmission.get('plainPassword')['second'] || ''}  type="password" disabled={isLoading} onChange={this.handlePasswordChange.bind(this)}/>
          </FormGroup>
        </div>
      );
    }

    return(
      <FormGroup controlId="email" validationState={_.get(this.state, ['inputsValidity', 'email', 'status'], null)}>
        <ControlLabel>Your email</ControlLabel>
        <FormControl type="text" value={this.state.email} disabled={isLoading} onChange={this.handleChange.bind(this)}/>
        {this.renderInputValidationAlerts('email')}
      </FormGroup>
    );
  }

  getSubmitButtonContent(){

    let isLoading = this.state.isLoading;

    if(this.props.params.token){
      return(
        <Button
          bsStyle="primary"
          className="btn-raised"
          disabled={isLoading}
          onClick={!isLoading ? () => {PasswordResetActions.reset(this.state.passwordResetSubmission, this.props.params.token)} : null}>
          {isLoading ? 'Loading...' : 'Reset Password'}
        </Button>
      );
    }

    return(
      <Button
        bsStyle="primary"
        className="btn-raised"
        disabled={isLoading}
        onClick={!isLoading ? () => {PasswordResetActions.sendResetRequest(this.state.email)} : null}>
        {isLoading ? 'Loading...' : 'Send Request'}
      </Button>
    );
  }

  render() {

    return (
      <div className="password-reset-form">
        <form action="#">
          <h4>Password Reset</h4>
          {this.state.alerts.map((message, key)=> {
            return <Alert key={key} bsStyle={message.level}>
              {message.messageText}
            </Alert>
          })}
          {this.renderInputValidationAlerts('__common')}
          {this.getInputsContent()}
          <Link to={'/login'} className="btn btn-primary" activeClassName="active" >Back to Login</Link>
          {this.getSubmitButtonContent()}
        </form>
      </div>
    );
  }
}

var container = Container.create(PasswordResetForm);
export default container;
