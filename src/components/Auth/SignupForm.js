import _                        from 'lodash';
import React                    from 'react';
import {Container}              from 'flux/utils';
import SignupActions            from 'actions/SignupActions';
import SignupStore              from 'stores/SignupStore';
import AuthStore                from 'stores/AuthStore';
import PwMeter                  from 'components/Common/PwMeter';
import PhoneInput               from 'react-phone-number-input'
import ModalReader              from 'components/Common/ModalReader';
import ServiceAgreementTxt      from 'resources/service-agreement.txt';
import ServiceDescriptionTxt    from 'resources/service-description.txt';
import { FormGroup, ControlLabel, FormControl, Button, Alert } from 'react-bootstrap';
import { Link, browserHistory } from 'react-router';

class SignupForm extends React.Component {

  constructor(props){
    super(props);
    this.state = SignupStore.getState();
  }

  static getStores() {
    return [SignupStore];
  }

  static calculateState() {
    return SignupStore.getState();
  }

  handleChange(event){
    const elementName = event.target.id;
    const oldValue    = this.state.userSubmission.get(elementName) || null;
    const newValue    = event.target.value;
    SignupActions.formValueChange(elementName, oldValue, newValue);
  }

  handlePhoneChange(newValue){
    const elementName = 'phone';
    const oldValue    = this.state.userSubmission.get(elementName) || null;
    SignupActions.formValueChange(elementName, oldValue, newValue);
  }

  handlePasswordChange(event){
    const elementName = 'plainPassword';
    const oldValue    = this.state.userSubmission.get(elementName) || null;
    const newValue    = Object.assign({}, oldValue);
    newValue[event.target.id] = event.target.value;
    SignupActions.formValueChange(elementName, oldValue, newValue);
  }

  handleAgreedToTermsChange(event){
    let document = event.target.getAttribute('data-document');
    let newValue = event.target.checked;
    SignupActions.termsAndConditionsAcceptance(document, newValue);
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

  render() {

    let isLoading = this.state.isLoading;
    let isSubmitDisabled = isLoading || (this.state.termsAndConditionsAcceptance.some(
      (isAccepted) => {return isAccepted === false}
    ));

    return (
      <div className="signup-form">

        <form action="#">

          <h4>Sign Up</h4>
          {this.state.alerts.map((message, key)=> {
            return <Alert key={key} bsStyle={message.level}>
              {message.messageText}
            </Alert>
          })}
          {this.renderInputValidationAlerts('__common')}

          <FormGroup controlId="name" validationState={_.get(this.state, ['inputsValidity', 'name', 'status'], null)}>
            <ControlLabel>Your Name</ControlLabel>
            <FormControl value={this.state.userSubmission.get('name')} type="text" disabled={isLoading} onChange={this.handleChange.bind(this)}/>
            {this.renderInputValidationAlerts('name')}
          </FormGroup>

          <FormGroup controlId="email" validationState={_.get(this.state, ['inputsValidity', 'email', 'status'], null)}>
            <ControlLabel>Email</ControlLabel>
            <FormControl type="text" value={this.state.userSubmission.get('email')} disabled={isLoading} onChange={this.handleChange.bind(this)}/>
            {this.renderInputValidationAlerts('email')}
          </FormGroup>

          <FormGroup controlId="phone" validationState={_.get(this.state, ['inputsValidity', 'phone', 'status'], null)}>
            <ControlLabel>Contact Phone</ControlLabel>
            <PhoneInput
              className="form-control"
              country="US"
              value={this.state.userSubmission.get('phone')}
              disabled={isLoading}
              placeholder="Enter phone number"
              onChange={this.handlePhoneChange.bind(this)} />
            {this.renderInputValidationAlerts('phone')}
          </FormGroup>

          <FormGroup controlId="first" validationState={_.get(this.state, ['inputsValidity', 'first', 'status'], null)}>
            <ControlLabel>Password</ControlLabel>
            <PwMeter value={this.state.userSubmission.get('plainPassword')['first'] || ''} disabled={isLoading} onChange={this.handlePasswordChange.bind(this)}/>
            {this.renderInputValidationAlerts('first')}
          </FormGroup>

          <FormGroup controlId="second" validationState={_.get(this.state, ['inputsValidity', 'second', 'status'], null)}>
            <ControlLabel>Re-Enter Password</ControlLabel>
            <FormControl value={this.state.userSubmission.get('plainPassword')['second'] || ''}  type="password" disabled={isLoading} onChange={this.handlePasswordChange.bind(this)}/>
          </FormGroup>

          <FormGroup>
            <input
              value={this.state.termsAndConditionsAcceptance.get('terms')}
              data-document="terms"
              type="checkbox" disabled={isLoading}
              onChange={this.handleAgreedToTermsChange.bind(this)}
            />
            <ControlLabel>I accept the &nbsp;
              <ModalReader
                title="Terms Of Service"
                body={ServiceAgreementTxt}
              />
            </ControlLabel>
          </FormGroup>

          <FormGroup>
            <input
              value={this.state.termsAndConditionsAcceptance.get('description')}
              data-document="description"
              type="checkbox"
              disabled={isLoading}
              onChange={this.handleAgreedToTermsChange.bind(this)}
            />
            <ControlLabel>I have read the &nbsp;
              <ModalReader
                title="Description of Services"
                body={ServiceDescriptionTxt}
              />
            </ControlLabel>
          </FormGroup>

          <Link to={'/login'} className="btn btn-primary" activeClassName="active" >Back to Login</Link>

          <Button
            bsStyle="primary"
            className="btn-raised"
            disabled={isSubmitDisabled}
            onClick={() => (SignupActions.signup(this.state.userSubmission))}>
            {isLoading ? 'Loading...' : 'Sign Up'}
          </Button>

        </form>
      </div>
    );
  }
}

var container = Container.create(SignupForm);
export default container;
