import React                  from 'react';
import { Container }          from 'flux/utils';
import DashboardThingActions  from 'actions/Dashboard/ThingActions';
import ThingStore             from 'stores/Dashboard/ThingStore';
import Gauge                  from 'components/Dashboard/Thing/Readings/Gauge';
import StringBlock            from 'components/Dashboard/Thing/Readings/StringBlock';
import StatefulPropertiesList from 'components/Dashboard/Thing/Readings/StatefulPropertiesList';
import Toggle                 from 'react-toggle-button';
import SpinnerCog             from 'components/SpinnerCog';
import ThemeVars              from 'theme_vars';

//These support the thing actions
import ThingActions   from 'actions/Things/ThingActions';
import Confirm        from 'components/Common/Confirm';
import { Link }       from 'react-router';

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

  renderPropertyReadingAsString(property){
    return(
      <StringBlock
        id    = {property.id}
        value = {property.value}
        min   = {property.min}
        max   = {property.max}
        label = {property.name}
        units = {property.units}
        time  = {new Date(property.time).toLocaleString()}
        error = {property.error}
        warningThresholds = {property.warning_thresholds}
      >
      </StringBlock>
    );
  }

  renderPropertyReadingAsGauge(property){
    return(
      <Gauge
        id    = {property.id}
        value = {Number(property.value)}
        min   = {property.min}
        max   = {property.max}
        label = {property.name}
        units = {property.units}
        time  = {new Date(property.time).toLocaleString()}
        error = {property.error}
        warningThresholds = {property.warning_thresholds}
      >
      </Gauge>
    );
  }

  render(){

    let isLoading = this.state.isLoading;

    if(isLoading){
      return(
        <div className="thing-readings-view">
          <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
        </div>
      );
    }

    return(
      <div className="thing-readings-view">
        <div className="header">
          <div className="title">
            <h3>{this.state.product.get('name') || 'Thing'} S/N:{this.state.thing.get('sn') || 'NEW'}</h3>
            <div className="actions">
              <div className="icons">
                <Link to={`/thing/${this.state.thing.get('id')}/history`}>
                  <i className="fa fa-bar-chart succcess" aria-hidden="true"></i>
                </Link>
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
        <div className="location">
          <div className="lat">
            <div className="title">Latitude:</div>
            <div className="value">{parseFloat(this.state.locationData.lat).toFixed(6) || 'N/A'}</div>
          </div>
          <div className="lng">
            <div className="title">Longtitude:</div>
            <div className="value"> {parseFloat(this.state.locationData.lng).toFixed(6) || 'N/A'}</div>
          </div>
          <div className="elev">
            <div className="title">Elevation: </div>
            <div className="value">{parseFloat(this.state.locationData.elev).toFixed(2) || 'N/A'}</div>
          </div>
        </div>
        <div className="row">
          {this.state.propertiesData.map((propertyReading, key) => {
            if(!propertyReading.isStateful && propertyReading.isNumeric){
              return(
                <div className="col-xs-12 col-md-4 col-lg-4" key={key}>
                  {this.renderPropertyReadingAsGauge(propertyReading)}
                </div>
              );
            }
          })}
          <div className="col-xs-12">
            <StatefulPropertiesList items={this.state.properties.filter((v) => {return v.isModeStateful})}/>
          </div>
          {this.state.propertiesData.map((propertyReading, key) => {
            if(!propertyReading.isStateful && !propertyReading.isNumeric){
              return(
                <div className="col-xs-12" key={key}>
                  {this.renderPropertyReadingAsString(propertyReading)}
                </div>
              );
            }
          })}
        </div>

      </div>
    );
  }
}

export default Container.create(ThingReadings);
