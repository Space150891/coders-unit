import AppDispatcher  from 'dispatcher';
import {ReduceStore}  from 'flux/utils';
import ThingConstants from 'constants/actions/Dashboard/Thing';
import Property       from 'entities/Property';
import AuthConstants  from 'constants/actions/Auth';
import Thing          from 'entities/Thing';
import Product        from 'entities/Product';
import Immutable      from 'immutable';

class ThingStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  getInitialState(){
    return {
      isLoading:          true,
      date:               new Date().toLocaleString(),
      thing:              new Thing(),
      product:            new Product(),
      properties:         new Immutable.List(),
      propertiesReadings: [],
      locationData:       {},
      historyData:        {},
      error:              null,
      doLiveUpdate:       true
    }
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      case ThingConstants.THING_LOAD_START:
        newState.isLoading    = true;
        newState.properties      = new Immutable.List();
        newState.propertiesData  = [];
        newState.error        = null;
        return newState;
        break;

      case ThingConstants.THING_LOADED:
        newState.thing = new Thing(action.data);
        return newState;
        break;

      case ThingConstants.THING_LOAD_END:
        newState.isLoading = false;
        return newState;
        break;

      case ThingConstants.THING_PRODUCT_LOADED:
        newState.product = new Product(action.data);
        return newState;
        break;

      case ThingConstants.THING_DEFINITIONS_LOADED:

        newState.properties = Immutable.fromJS(action.data.propertiesData, function(k,v){
          if('' === k){
            return v.toMap();
          }
          if('states' === k){
            return v.toList();
          }
          //this has to go before the return v
          if(v.get('id') != undefined && v.get('name') != undefined){
            return new Property(v);
          }
          return v.toMap();
        });

        newState.properties = newState.properties.sort((a,b) => {
          if(a['name'] && b['name']){
            return a['name'].localeCompare(b['name']);
          } return 0;
        });

        return newState;
        break;

      case ThingConstants.THING_READINGS_LOADED:

        try{

          let readingsData       = action.data.readingsData;
          let errorsData         = action.data.errorsData;
          let propertiesReadings = readingsData['properties'];
          let locationReadings   = readingsData['location'];

          //LOCATION
          let locationData = {
            lat: null,
            lng: null,
            elev: null
          };

          if(locationReadings){
            locationData.lat   = locationReadings['v1']  || null;
            locationData.lng   = locationReadings['v2']  || null;
            locationData.elev  = locationReadings['v3']  || null;
          }

          newState.locationData = locationData;

          //PROPERTIES (sensors and controls)
          let propertiesReadingsData = [];

          state.properties.map((propertyDefinition) => {
              let tsKey  = 't' + propertyDefinition.id;
              let valKey = 'v' + propertyDefinition.id;
              if(propertiesReadings[tsKey] && propertiesReadings[valKey]){
                propertiesReadingsData.push(Object.assign(propertyDefinition, {
                  time:  parseInt(propertiesReadings[tsKey]),
                  value: propertiesReadings[valKey],
                  error: errorsData[propertyDefinition.id] || null,
                  isStateful: propertyDefinition.isModeStateful
                }));
              }
          });

          newState.propertiesData = propertiesReadingsData;

          newState.error = null;

        } catch(err){
          newState.error = err.message;
        }

        return newState;
        break;

      case ThingConstants.THING_LIVE_UPDATES_CHANGE:
        newState.doLiveUpdate = action.data.doLiveUpdate;
        return newState;
        break;

      case ThingConstants.THING_ERROR:
        newState.error = action.error;
        return newState;
        break;

      case AuthConstants.AUTH_LOGOUT:
        return this.getInitialState();
        break;

      default:
        return state;
    }

  }

}

export default new ThingStore();
