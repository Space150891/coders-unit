import React                    from 'react';
import PropTypes                from 'prop-types';
import { browserHistory, Link } from 'react-router'
import iMatrixPropTypes from 'utils/iMatrixPropTypes';
import { Container }    from 'flux/utils';
import Confirm          from 'components/Common/Confirm';
import ThingStore       from 'stores/Things/ThingStore';
import ThingActions     from 'actions/Things/ThingActions';
import GroupTreeSelect              from 'components/Common/GroupTreeSelect';
import { Button, Alert, FormGroup } from 'react-bootstrap';
import SpinnerCog                   from 'components/SpinnerCog';


class ThingForm extends React.Component{

  constructor(props){
    super(props);
    this.bootstrap(props.params.id);
    //This should fire once router attempts to move away from a current page
    props.router.setRouteLeaveHook(props.route,this.onRouteLeave.bind(this));
  }

  static getStores(){
    return [ThingStore];
  }

  static calculateState(prevState){
    if(!prevState){
      let initialState = ThingStore.getState();
      initialState.confirmation        = null;
      initialState.isForwardingToRoute = false;
      return initialState;
    } else {
      let newState = ThingStore.getState();
      newState.confirmation        = prevState.confirmation;
      newState.isForwardingToRoute = prevState.isForwardingToRoute;
      return newState;
    }
  }

  bootstrap(id){
    if(id){
      ThingActions.formEditStart(id);
    } else {
      ThingActions.formCreate();
    }
  }

  componentDidMount(){}

  componentWillReceiveProps(nextProps){
    if(nextProps.params.id != this.props.params.id){
      this.bootstrap(nextProps.params.id);
    }
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
    if(ThingStore.hasChanged() && !this.state.isForwardingToRoute){

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
    ThingActions.formValueChange(elementName, oldValue, newValue);
  }

  cleanForm () {
    if(this.state.alerts.length === 1 && this.state.alerts[0].level === 'success'){
      ThingActions.formValueReset();
    }
  }

  render(){

    if(true === this.state.isLoading){
      return <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
    }
    return (
      <div className="form-thing">
        <div className="header">
          <div className="title">
            <h3>{this.state.thing.get('name')} Thing Edit</h3>
          </div>
        </div>
        <div className="form">
          {this.state.alerts.map((message, key)=> {
            return <Alert key={key} bsStyle={message.level}>
              {message.messageText} {message.level === 'success' &&
                <Link style={{textDecoration: 'underline'}} to={`/thing/${this.state.data.id}/map`}>
                  Click here
                </Link>
              }
            </Alert>
          })}

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
            <label htmlFor="sn">
              Serial Number
            </label>
            <input
              className="form-control"
              type="text"
              name="sn"
              value={this.state.draft.get('sn')}
              onChange={this.handleChange.bind(this)}/>
          </FormGroup>

          <FormGroup>
            <label htmlFor="product">
              Product
            </label>
            <select
              className="form-control"
              name="product"
              value={this.state.draft.get('product') || '#'}
              onChange={this.handleChange.bind(this)}>
              <option value="#" key="#" disabled>Select a Product</option>
              {this.state.products.map((product, key) => {
                return  <option value={product.get('id')} key={key}>{product.get('name')}</option>
              })}
            </select>
          </FormGroup>

          <FormGroup>
            <label htmlFor="group">
              Group
            </label>
            <GroupTreeSelect
              groups={this.state.groups}
              activeGroupId={this.state.draft.get('group')}
              onChange={this.handleChange.bind(this)}
            />
          </FormGroup>

        </div>
        {/*<div className="sensors">*/}
          {/*<h3>Sensors</h3>*/}
          {/*<Button bsStyle="success" bsSize="small" onClick={() => {ThingActions.formSensorCreate()}}>+ New</Button>*/}
          {/*<SensorsList data={this.state.draft.get('sensors')} showActions={true}/>*/}
        {/*</div>*/}
        {/*<div className="controls">*/}
          {/*<h3>Controls</h3>*/}
          {/*<Button bsStyle="success" bsSize="small" onClick={() => {ThingActions.formControlCreate()}}>+ New</Button>*/}
          {/*<ControlsList data={this.state.draft.get('controls')} showActions={true}/>*/}
        {/*</div>*/}
        {ThingStore.hasChanged()
          ?
          <div className="actions">
            <Button bsStyle="success" className="btn-raised"
              onClick={() => {ThingActions.formSave(this.state.draft).then(this.cleanForm.bind(this))}}>
              Save
            </Button>
            <Button bsStyle="danger"  className="btn-raised" onClick={ThingActions.formDiscard}>Discard</Button>
          </div>
          :
          null}
        {/*<Modal show={this.state.isEditingSensor} onHide={ThingActions.formChildrenEditDiscard}>*/}
          {/*<Modal.Header closeButton>*/}
            {/*<Modal.Title>Sensor Edit</Modal.Title>*/}
          {/*</Modal.Header>*/}
          {/*<Modal.Body>*/}
            {/*<SensorForm*/}
              {/*sensor={*/}
                {/*this.state.draft*/}
                  {/*.get('sensors')*/}
                  {/*.get(this.state.editingSensorKey)*/}
              {/*}*/}
              {/*sensorKey={this.state.editingSensorKey}*/}
            {/*/>*/}
          {/*</Modal.Body>*/}
          {/*<Modal.Footer>*/}
            {/*<Button onClick={ThingActions.formChildrenEditDiscard}>Close</Button>*/}
          {/*</Modal.Footer>*/}
        {/*</Modal>*/}
        {/*<Modal show={this.state.isEditingControl} onHide={ThingActions.formChildrenEditDiscard}>*/}
          {/*<Modal.Header closeButton>*/}
            {/*<Modal.Title>Control Edit</Modal.Title>*/}
          {/*</Modal.Header>*/}
          {/*<Modal.Body>*/}
            {/*<ControlForm*/}
              {/*control={*/}
                {/*this.state.draft*/}
                  {/*.get('controls')*/}
                  {/*.get(this.state.editingControlKey)*/}
              {/*}*/}
              {/*controlKey={this.state.editingControlKey}*/}
            {/*/>*/}
          {/*</Modal.Body>*/}
          {/*<Modal.Footer>*/}
            {/*<Button onClick={ThingActions.formChildrenEditDiscard}>Close</Button>*/}
          {/*</Modal.Footer>*/}
        {/*</Modal>*/}
        {this.state.confirmation}
      </div>
    );

  }

}

ThingForm.propTypes = {
  id:    PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.number]) //Thing id or null for the new product
}

export default Container.create(ThingForm);
