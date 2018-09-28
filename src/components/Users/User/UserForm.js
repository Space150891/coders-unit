import PropTypes from 'prop-types';
import React                         from 'react';
import iMatrixPropTypes              from 'utils/iMatrixPropTypes';
import { Container }                 from 'flux/utils';
import Confirm                       from 'components/Common/Confirm';
import UserStore                     from 'stores/Users/UserStore';
import UserActions                   from 'actions/Users/UserActions';
import { Button, Alert, FormGroup }  from 'react-bootstrap';
import SpinnerCog                    from 'components/SpinnerCog';
import { browserHistory }            from 'react-router';
import wifiSecurityModes             from 'constants/WifiSecurityModes';

class UserForm extends React.Component{

  constructor(props){
    super(props);
    this.bootstrap();
    //This should fire once router attempts to move away from a current page
    props.router.setRouteLeaveHook(props.route,this.onRouteLeave.bind(this));
  }

  static getStores(){
    return [UserStore];
  }

  static calculateState(prevState){
    if(!prevState){
      let initialState = UserStore.getState();
      initialState.confirmation        = null;
      initialState.isForwardingToRoute = false;
      return initialState;
    } else {
      let newState = UserStore.getState();
      newState.confirmation        = prevState.confirmation;
      newState.isForwardingToRoute = prevState.isForwardingToRoute;
      return newState;
    }
  }

  bootstrap(){
    UserActions.formEditStart();
  }

  componentDidMount(){}

  componentWillReceiveProps(){
    //Don't forget to set these back to default!
    this.setState({
      isForwardingToRoute: false,
      confirmation: null
    });
  }

  /**
   * this.props.router.setRouteLeaveHook is what sets these
   * @returns {boolean}
   */
  onRouteLeave(nextLocation){

    //Trying to go away while there are unsaved changes?
    if(UserStore.hasChanged() && !this.state.isForwardingToRoute){

      this.setState((prevState) => {
        let newState = prevState;
        newState.confirmation = <Confirm
          visible={true}
          onConfirm={function(){
            //When we do forwarding, the same hook will be called again
            //We set a flag in the state to make sure we don't enter a loop
            this.setState({isForwardingToRoute: true, confirmation: null}, () => {
              browserHistory.transitionTo(nextLocation);
            });
          }.bind(this)}
          onClose={function(){
            this.setState({confirmation: null});
          }.bind(this)}
          body="You have unsaved items left, would you really like to leave?"
          confirmText="Leave"
          title="Confirmation Required">
        </Confirm>;
        return newState;
      });

      //@TODO Why it doesn't work without this?
      //Without the forceUpdate() the component just won't re-render
      this.forceUpdate();

      return false;
    }
  }

  handleChange(event){
    const elementName = event.target.name;
    const oldValue = this.state.draft.get(elementName);
    let newValue = null;
    if('checkbox' === event.target.type){
      newValue = event.target.checked;
    } else {
      newValue = event.target.value;
    }
    UserActions.formValueChange(elementName, oldValue, newValue);
  }

  render(){

    if(true === this.state.isLoading){
      return <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
    }

    return (
      <div className="form-User">
        <div className="header">
          <div className="title">
            <h3>{this.state.user.get('username')} settings</h3>
          </div>
        </div>
        <div className="form">

          {this.state.alerts.map((message, key)=> {
            return <Alert key={key} bsStyle={message.level}>
              {message.messageText.split('<br/>').map(item => <div>{item}</div>)}
            </Alert>
          })}

          <div className="section section wifi-settings">
            <h4>Wireless Connectivity Settings</h4>
            <FormGroup>
              <label htmlFor="stSsid">
                SSID
              </label>
              <input
                className="form-control"
                type="text"
                name="stSsid"
                value={this.state.draft.get('stSsid')}
                onChange={this.handleChange.bind(this)}
                placeholder="Required unless supplied manually, 25 characters max."
              />
            </FormGroup>
            <FormGroup>
              <label htmlFor="stKey">
                Key
              </label>
              <input
                className="form-control"
                type="text"
                name="stKey"
                value={this.state.draft.get('stKey')}
                onChange={this.handleChange.bind(this)}
                placeholder="If applies, 8+ characters"
              />
            </FormGroup>
            <FormGroup>
              <label htmlFor="stSecurityMode">
                Security Mode
              </label>
              <select
                className="form-control"
                name="stSecurityMode"
                value={this.state.draft.get('stSecurityMode')}
                onChange={this.handleChange.bind(this)}
              >
                <option value="" disabled>Choose Security Mode</option>
                {wifiSecurityModes.entrySeq().map((entry) => {
                  return  <option value={entry[0]} key={entry[0]}>{entry[1]}</option>
                })}
              </select>
            </FormGroup>
          </div>

          <div className="section account-settings">
            <h4>Account settings</h4>
            <FormGroup>
              <label htmlFor="name">
                Name
              </label>
              <input
                className="form-control"
                type="text"
                name="name"
                value={this.state.draft.get('name')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
            <FormGroup>
              <label htmlFor="phone">
                Phone
              </label>
              <input
                className="form-control"
                type="text"
                name="phone"
                value={this.state.draft.get('phone')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
            <FormGroup>
              <label htmlFor="email">
                Email
              </label>
              <input
                className="form-control"
                type="text"
                name="email"
                value={this.state.draft.get('email')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
          </div>

        </div>
        {UserStore.hasChanged()
          ?
          <div className="actions">
            <FormGroup>
              <label htmlFor="currentPassword">
                Your Password
              </label>
              <input
                className="form-control"
                type="text"
                name="currentPassword"
                value={this.state.draft.get('currentPassword')}
                onChange={this.handleChange.bind(this)}
                placeholder="Password required to save changes"
              />
            </FormGroup>
            <Button
              bsStyle="success"
              className="btn-raised"
              disabled={!(this.state.draft.get('currentPassword').length > 0)}
              onClick={() => {UserActions.formSave(this.state.draft)}}>
              Save
            </Button>
            <Button bsStyle="danger" className="btn-raised" onClick={UserActions.formDiscard}>Discard</Button>
          </div>
          :
          null}
        {this.state.confirmation}
      </div>
    );
  }
}

UserForm.propTypes = {
  id:    PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.number]) //Users id or null for the new product
}

export default Container.create(UserForm);
