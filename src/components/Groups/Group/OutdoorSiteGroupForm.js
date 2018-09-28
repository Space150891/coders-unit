import React             from 'react';
import { Container }     from 'flux/utils';
import PropTypes         from 'prop-types';
import {browserHistory}  from 'react-router';
import iMatrixPropTypes  from 'utils/iMatrixPropTypes';
import GmapAddressGeocoder from 'components/Common/GmapAddressGeocoder';
import { Button, Alert, FormGroup } from 'react-bootstrap';
import SpinnerCog        from 'components/SpinnerCog';
import Confirm           from 'components/Common/Confirm';
import GroupActions      from 'actions/Groups/GroupActions';
import GroupStore        from 'stores/Groups/GroupStore';
import GroupTypes        from 'constants/GroupTypes';
import Gmap              from 'components/Common/Gmap';

//http://jsfiddle.net/k0ye3v9z/63/
//http://jsfiddle.net/dg9e93qy/188/
class OutdoorGroupForm extends  React.Component{

  constructor(props){
    super(props);
    //The following is moved here because the componentDidMount (and willMount) are called after the initial state is assigned
    //So when component changes - it first renders the previous state of newly rendered one and only then starts loading sequence
    //Since the this.state is not available here - we use the store directly to check if this is the same product
    this.bootstrap(props.params.groupId);
    props.router.setRouteLeaveHook(props.route, this.onRouteLeave.bind(this));

    this.drawingManager = null;
    this.gmap = null;
  }

  static getStores(){
    return [GroupStore];
  }

  static calculateState(prevState){
    if(!prevState){
      let initialState = GroupStore.getState();
      initialState.confirmation        = null;
      initialState.isForwardingToRoute = false;
      return initialState;
    } else {
      let newState = GroupStore.getState();
      newState.confirmation        = prevState.confirmation;
      newState.isForwardingToRoute = prevState.isForwardingToRoute;
      return newState;
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.params.groupId != this.props.params.groupId){
      this.bootstrap(nextProps.params.groupId);
    }
    //Don't forget to set these back to default!
    this.setState({
      isForwardingToRoute: false,
      confirmation: null
    });
  }

  bootstrap(id){
    if (id) {
      GroupActions.load(id).then(GroupActions.formEditStart);
    } else {
      GroupActions.formCreate(GroupTypes.get('GROUP_TYPE_OUTDOOR_SITE'), this.props.params.parentId);
      GroupActions.formEditStart();
    }
  }

  initDrawingManager(map) {
    this.drawingManager = new window.google.maps.drawing.DrawingManager({
      map: map,
      drawingControlOptions: {
        drawingControl: true,
        position:       window.google.maps.ControlPosition.TOP_CENTER,
        drawingMode:    window.google.maps.drawing.OverlayType.POLYGON,
        drawingModes: [
          window.google.maps.drawing.OverlayType.POLYGON
        ]
      },
      polygonOptions: {
        editable: true,
        strokeColor: "#68ab00",
        fillColor:   "#68ab00",
      }

    });
    window.google.maps.event.addListener(
      this.drawingManager,
      'polygoncomplete',
      this.handlePolygonComplete.bind(this)
    );
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
    GroupActions.formValueChange(elementName, oldValue, newValue);
  }

  handleGmapRef(gmap){
    //Checking to make sure it's not null, that happens on unmount
    //https://github.com/facebook/react/issues/4533
    if(gmap){
      this.gmap = gmap
      this.gmap.map.data.setStyle({
        editable: false,
        draggable: false,
        strokeColor: "#3b79d4",
        fillColor: "#bfddf4"
      });
      this.initDrawingManager(this.gmap.map);
    } else {
      this.gmap = null;
      //This is important unless you want to end up with multiple drawing controls
      this.drawingManager.setMap(null);
    }
  }

  handlePolygonComplete(e){
    //Make sure that we don't jump back to the map center when a new shape is added
    //Rather let it fit the new bounds
    GroupActions.setOutdoorMapCenter(null);
    this.savePolygon(e);
  }

  savePolygon(overlay) {

    let bounds = [];

    overlay.getPath().getArray().forEach(function(latLng){
      bounds.push({lat: latLng.lat(), lng: latLng.lng()});
    });

    this.gmap.map.data.forEach(function (f) {
      this.gmap.map.data.remove(f);
    }.bind(this));

    this.gmap.map.data.add({geometry: new window.google.maps.Data.Polygon([bounds])});

    this.gmap.map.data.toGeoJson(function (json) {
      GroupActions.formValueChange('areaGeoJson', this.state.draft.get('areaGeoJson'), JSON.stringify(json));
      overlay.setMap(null);
    }.bind(this));
  }

  /**
   * this.props.router.setRouteLeaveHook is what sets these
   * @returns {boolean}
   */
  onRouteLeave(nextLocation){

    //Trying to go away while there are unsaved changes?
    if(GroupStore.hasChanged() && !this.state.isForwardingToRoute){
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

  render(){

    if(true === this.state.isLoading){
      return <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
    }

    return(
      <div className="form-group">
        <div className="header">
          <div className="title">
            <h3>{this.state.name} Group Edit</h3>
          </div>
        </div>
        <div className="form">
          {this.state.alerts.map((message, key)=> {
            return <Alert key={key} bsStyle={message.level}>
              {message.messageText}
            </Alert>
          })}
          <div className="row">
            <div className="col-xs-12">
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
            </div>
            <div className="col-xs-12">
              <GmapAddressGeocoder
                onGeocode={GroupActions.setOutdoorMapCenter}
              />
            </div>
          </div>
        </div>
        <div>
          <Gmap
            ref={this.handleGmapRef.bind(this)}
            center={this.state.outdoorMapCenter}
            geoJson={this.state.draft.get('areaGeoJson')}
          ></Gmap>
        </div>
        {GroupStore.hasChanged()
          ?
          <div className="actions">
            <Button bsStyle="success" className="btn-raised" onClick={() => {GroupActions.formSave(this.state.draft)}}>Save</Button>
            <Button bsStyle="danger"  className="btn-raised" onClick={GroupActions.formDiscard}>Discard</Button>
          </div>
          :
          null}
        {this.state.confirmation}
      </div>
    );
  }
}

OutdoorGroupForm.propTypes = {
  id: PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.number]), //Group id or null for the new Group
};

export default Container.create(OutdoorGroupForm);
