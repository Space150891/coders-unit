import PropTypes                           from 'prop-types';
import React                               from 'react';
import { Container }                       from 'flux/utils';
import { browserHistory }            from 'react-router'
import iMatrixPropTypes                    from 'utils/iMatrixPropTypes';
import { Button, Modal, Alert, FormGroup } from 'react-bootstrap';
import SpinnerCog                          from 'components/SpinnerCog';
import Confirm                             from 'components/Common/Confirm';
import PropertiesList                      from 'components/Products/Product/PropertiesList';
import PropertyForm                        from 'components/Products/Product/PropertyForm';
import ProductStore                        from 'stores/Products/ProductStore';
import ProductActions                      from 'actions/Products/ProductActions';
import Interfaces                          from 'constants/Interfaces';
import wifiSecurityModes                   from 'constants/WifiSecurityModes';
import Property                            from 'entities/Property';

class ProductForm extends React.Component{

  constructor(props){
    super(props);
    //The following is moved here because the componentDidMount (and willMount) are called after the initial state is assigned
    //So when component changes - it first renders the previous state of newly rendered one and only then starts loading sequence
    //Since the this.state is not available here - we use the store directly to check if this is the same product
    this.bootstrap(props.params.id);
    props.router.setRouteLeaveHook(props.route, this.onRouteLeave.bind(this));
  }

  static getStores(){
    return [ProductStore];
  }

  static calculateState(prevState){
    if(!prevState){
      let initialState = ProductStore.getState();
      initialState.confirmation        = null;
      initialState.isForwardingToRoute = false;
      return initialState;
    } else {
      let newState = ProductStore.getState();
      newState.confirmation        = prevState.confirmation;
      newState.isForwardingToRoute = prevState.isForwardingToRoute;
      return newState;
    }
  }

  bootstrap(id){
    if(id){
      ProductActions.formEditStart(id);
    } else {
      ProductActions.formCreate();
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
    if(ProductStore.hasChanged() && !this.state.isForwardingToRoute){
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
    ProductActions.formValueChange(elementName, oldValue, newValue);
  }

  render(){

    if(true === this.state.isLoading){
      return <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
    }

    let editingProperty = this.state.draft.getIn(['properties', this.state.editingPropertyKey], new Property());

    return (
      <div className="form-product">
        <div className="header">
          <div className="title">
            <h3>{this.state.name} Product Edit</h3>
          </div>
        </div>
        <div className="form">
          {this.state.alerts.map((message, key)=> {
            return <Alert key={key} bsStyle={message.level}>
              {message.messageText}
            </Alert>
          })}
          <div className="row">
            <div className="col-lg-3 col-sm-12 col-md-4">
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
                <label htmlFor="platform">
                  Platform
                </label>
                <select
                  className="form-control"
                  name="platform"
                  value={this.state.draft.get('platform').id || ''}
                  onChange={this.handleChange.bind(this)}
                >
                  <option value="" disabled>Choose Platform</option>
                  {this.state.platforms.map((platform, key) => {
                    return  <option value={platform.get('id')} key={key}>{platform.get('name')}</option>
                  })}
                </select>
              </FormGroup>
              <FormGroup>
                <label htmlFor="isPublished">
                  Is Published
                  <input
                    name="isPublished"
                    type="checkbox"
                    checked={this.state.draft.get('isPublished')}
                    onChange={this.handleChange.bind(this)}/>
                </label>
              </FormGroup>
              <FormGroup>
                <label htmlFor="isAtCommandMode">
                  AT Command Mode
                  <input
                    name="isAtCommandMode"
                    type="checkbox"
                    checked={this.state.draft.get('isAtCommandMode')}
                    onChange={this.handleChange.bind(this)}/>
                </label>
              </FormGroup>
              <FormGroup>
                <label htmlFor="doScanForBleThings">
                  Scan for BLE Things
                  <input
                    name="doScanForBleThings"
                    type="checkbox"
                    checked={this.state.draft.get('doScanForBleThings')}
                    onChange={this.handleChange.bind(this)}/>
                </label>
              </FormGroup>
              <FormGroup>
                <label htmlFor="doReportBleThings">
                  Report BLE Things
                  <input
                    name="doReportBleThings"
                    type="checkbox"
                    checked={this.state.draft.get('doReportBleThings')}
                    onChange={this.handleChange.bind(this)}/>
                </label>
              </FormGroup>
            </div>
            <div className="section">
              <div className="col-lg-3 col-sm-12 col-md-4">
                <FormGroup>
                  <label htmlFor="interface">
                    Interface
                  </label>
                  <select
                    className="form-control"
                    name="interface"
                    value={this.state.draft.get('interface')}
                    onChange={this.handleChange.bind(this)}
                  >
                    <option value="" disabled>Choose Interface</option>
                    {Interfaces.entrySeq().map((entry) => {
                      return  <option value={entry[0]} key={entry[0]}>{entry[1]}</option>
                    })}
                  </select>
                </FormGroup>
                <FormGroup>
                  <label htmlFor="doStartInStationMode">
                    Start as a WiFi client
                    <input
                      name="doStartInStationMode"
                      type="checkbox"
                      checked={this.state.draft.get('doStartInStationMode')}
                      onChange={this.handleChange.bind(this)}/>
                  </label>
                </FormGroup>
                <FormGroup>
                  <label htmlFor="wifiDoScanOnSchedule">
                    Scan on schedule
                    <input
                      name="wifiDoScanOnSchedule"
                      type="checkbox"
                      checked={this.state.draft.get('wifiDoScanOnSchedule')}
                      onChange={this.handleChange.bind(this)}/>
                  </label>
                </FormGroup>
                <FormGroup>
                  <label htmlFor="wifiDoScanAtTime">
                    Scan at time
                    <input
                      name="wifiDoScanAtTime"
                      type="checkbox"
                      checked={this.state.draft.get('wifiDoScanAtTime')}
                      onChange={this.handleChange.bind(this)}/>
                  </label>
                </FormGroup>
                <FormGroup>
                  <label htmlFor="wifiDoReportWifiScan">
                    Report WiFi scan
                    <input
                      name="wifiDoReportWifiScan"
                      type="checkbox"
                      checked={this.state.draft.get('wifiDoReportWifiScan')}
                      onChange={this.handleChange.bind(this)}/>
                  </label>
                </FormGroup>
                <FormGroup>
                  <label htmlFor="wifiDoScanForBestAP">
                    Scan for best AP
                    <input
                      name="wifiDoScanForBestAP"
                      type="checkbox"
                      checked={this.state.draft.get('wifiDoScanForBestAP')}
                      onChange={this.handleChange.bind(this)}/>
                  </label>
                </FormGroup>
              </div>
              <div className="col-lg-3 col-sm-12 col-md-4">
                <FormGroup>
                  <label htmlFor="defaultApSsid">
                    Default AP SSID
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="defaultApSsid"
                    value={this.state.draft.get('defaultApSsid')}
                    onChange={this.handleChange.bind(this)}
                    placeholder="Leave blank to generate"
                  />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="defaultApKey">
                    Default AP key
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="defaultApKey"
                    value={this.state.draft.get('defaultApKey')}
                    onChange={this.handleChange.bind(this)}
                    placeholder="At least 8 characters"
                  />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="defaultApSecurityMode">
                    Default AP Security Mode
                  </label>
                  <select
                    className="form-control"
                    name="defaultApSecurityMode"
                    value={this.state.draft.get('defaultApSecurityMode')}
                    onChange={this.handleChange.bind(this)}
                  >
                    <option value="" disabled>Choose Security Mode</option>
                    {wifiSecurityModes.entrySeq().map((entry) => {
                      return  <option value={entry[0]} key={entry[0]}>{entry[1]}</option>
                    })}
                  </select>
                </FormGroup>
              </div>
            </div>
            <div className="section">
              <div className="col-lg-3 col-sm-12 col-md-4">
                <FormGroup>
                  <label htmlFor="wifiScanTime">
                    WiFi scan time
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="wifiScanTime"
                    value={this.state.draft.get('wifiScanTime')}
                    onChange={this.handleChange.bind(this)}
                    placeholder="in seconds"
                  />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="wifiScanPeriod">
                    WiFi scan period
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="wifiScanPeriod"
                    value={this.state.draft.get('wifiScanPeriod')}
                    onChange={this.handleChange.bind(this)}
                    placeholder="in seconds"
                  />
                </FormGroup>
                  <FormGroup>
                    <label htmlFor="doLogWifiAp">
                      Log WiFi AP
                      <input
                        name="doLogWifiAp"
                        type="checkbox"
                        checked={this.state.draft.get('doLogWifiAp')}
                        onChange={this.handleChange.bind(this)}/>
                    </label>
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="doLogWifiRssi">
                      Log WiFi RSSI
                      <input
                        name="doLogWifiRssi"
                        type="checkbox"
                        checked={this.state.draft.get('doLogWifiRssi')}
                        onChange={this.handleChange.bind(this)}/>
                    </label>
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="doLogWifiRfNoise">
                      Log WiFi RF Noise
                      <input
                        name="doLogWifiRfNoise"
                        type="checkbox"
                        checked={this.state.draft.get('doLogWifiRfNoise')}
                        onChange={this.handleChange.bind(this)}/>
                    </label>
                  </FormGroup>
                </div>
              </div>
          </div>
        </div>
        <div className="controls">
          <h3>Properties</h3>
          <div className="content">
            <Button bsStyle="success" bsSize="small" onClick={() => {ProductActions.formPropertyCreate()}}>+ New</Button>
            <PropertiesList data={this.state.draft.get('properties')} showActions={true}/>
            <h4>Integrated</h4>
            <PropertiesList data={this.state.draft.get('platform').get('properties')} showActions={true} isIntegrated={true} disabledIntegratedProperties={this.state.draft.get('disabledIntegratedProperties')}/>
          </div>
        </div>
        {ProductStore.hasChanged()
          ?
          <div className="actions">
            <Button bsStyle="success" className="btn-raised" onClick={() => {ProductActions.formSave(this.state.draft)}}>Save</Button>
            <Button bsStyle="danger"  className="btn-raised" onClick={ProductActions.formDiscard}>Discard</Button>
          </div>
          :
          null}
        <Modal show={this.state.isEditingProperty} onHide={ProductActions.formChildrenEditDiscard}>
          <Modal.Header closeButton>
            <Modal.Title>Property Edit</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PropertyForm
              property={editingProperty}
              propertyKey={this.state.editingPropertyKey}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={ProductActions.formChildrenEditDiscard}>Close</Button>
          </Modal.Footer>
        </Modal>
        {this.state.confirmation}
      </div>
    );
  }
}

ProductForm.propTypes = {
  id:    PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.number]) //File id or null for the new product
}

export default Container.create(ProductForm);
