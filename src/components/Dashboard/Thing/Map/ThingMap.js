import _                    from 'lodash';
import React                from 'react';
import { Container }        from 'flux/utils';
import DashboardThingActions from 'actions/Dashboard/ThingActions';
import ThingStore           from 'stores/Dashboard/ThingStore';
import Gmap                 from 'components/Common/Gmap';
import Toggle               from 'react-toggle-button';
import SpinnerCog           from 'components/SpinnerCog';
import GmapMarker           from 'entities/GmapMarker';
import Immutable            from 'immutable';
import ThemeVars            from 'theme_vars';

//These support the thing actions
import ThingActions from 'actions/Things/ThingActions';
import Confirm      from 'components/Common/Confirm';
import { Link }     from 'react-router';

class ThingReadings extends React.Component{

  constructor(props){
    super(props);
    DashboardThingActions.load(this.props.params.id);
  }

  static getStores() {
    return [ThingStore];
  }

  static calculateState() {
    return ThingStore.getState();
  }

  componentWillReceiveProps(nextProps){
    if(this.props.params.id != nextProps.params.id){
      DashboardThingActions.load(nextProps.params.id);
    }
  }

  componentDidMount(){
    this.updateTimer = setInterval(() => {
      if(true === this.state.doLiveUpdate){
        DashboardThingActions.loadReadings(this.props.params.id);
      }
    }, 10000);
  }

  componentWillUnmount(){
    clearInterval(this.updateTimer);
  }

  _getMarkerData(){
    let lat = _.get(this.state, 'locationData.lat');
    let lng = _.get(this.state, 'locationData.lng');
    let dataMap = new Immutable.Map();
    if(lat && lng){
      let thingMarker = new GmapMarker({
        position: {
          lat: _.get(this.state, 'locationData.lat'),
          lng: _.get(this.state, 'locationData.lng')
        }
      });
      return dataMap.set(this.props.params.id, thingMarker);
    }
    return dataMap;
  }

  render(){

    let isLoading = this.state.isLoading;
    let markerData = this._getMarkerData();

    if(isLoading){
      return(
        <div className="thing-map-view">
          <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
        </div>
      );
    }

    return(
      <div className="thing-map-view">
        <div className="header">
          <div className="title">
            <h3>{this.state.product.get('name') || 'Thing'} S/N:{this.state.thing.get('sn') || 'NEW'}</h3>
            <div className="actions">
              <div className="icons">
                <Link to={`/things/${this.state.thing.get('id')}/edit`}>
                  <i className="fa fa-pencil info" aria-hidden="true"></i>
                </Link>
                <Confirm
                  onConfirm={function(){ThingActions.delete(this.state.thing.get('id'))}.bind(this)}
                  body="Are you sure you want to delete this thing? This action cannot be undone."
                  confirmText="Confirm Delete"
                  title="Confirmation Required">
                  <a href="#">
                    <i className="fa fa-trash danger" aria-hidden="true"></i>
                  </a>
                </Confirm>
              </div>
            </div>
          </div>
          <div className="live-update-toggle">
            <div className="toggle">
              <Toggle
                onToggle={() => {
                  DashboardThingActions.changeLiveUpdates(!this.state.doLiveUpdate);
                }}
                value={this.state.doLiveUpdate}
                colors={{
                  active:   {base: ThemeVars.toggleColorActiveBase  , hover: ThemeVars.toggleColorActiveHover  },
                  inactive: {base: ThemeVars.toggleColorInactiveBase, hover: ThemeVars.toggleColorInactiveHover}
                }}
              />
            </div>
            <div className="toggle-label">
              Live Update
            </div>
          </div>
        </div>
        <div className="content">
          {(0 === markerData.size) ?
            <h4>No location data available</h4>
            :
            <Gmap markersData={markerData}></Gmap>
          }
        </div>
      </div>
    );
  }
}

export default Container.create(ThingReadings);
