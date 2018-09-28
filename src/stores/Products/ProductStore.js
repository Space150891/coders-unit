import AppDispatcher      from 'dispatcher';
import AuthConstants      from 'constants/actions/Auth';
import ProductConstants   from 'constants/actions/Products/Product';
import {ReduceStore}      from 'flux/utils';
import Product            from 'entities/Product';
import Platform           from 'entities/Platform';
import Immutable          from 'immutable';
import Property           from 'entities/Property';

class ProductStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  hasChanged(){
    const state = this.getState();
    return !(true === Immutable.is(state.draft,state.product));
  }

  getInitialState(){
    let defaultState = {
      platforms: new Immutable.List(),
      data: {
        platform:     new Platform(),
        organization: {},
        properties:      new Immutable.Map()
      },
      product: new Product(),
      draft:   new Product(),
      alerts:  [],
      isEditingProperty:   false,
      editingPropertyKey:  null
    };
    return defaultState;
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      // LOADING etc
      case ProductConstants.PRODUCTS_PRODUCT_LOAD_START:
        newState.isLoading = true;
        newState.alerts = [];
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_PLATFORMS_LOADED:
        return ((newState) => {
          let platforms = new Immutable.List();
          action.data.map((platformData) => {
            platforms = platforms.push(new Platform(Immutable.fromJS(platformData)));
          });
          newState.platforms = platforms;
          return newState;
        })(newState)
        break;

      case ProductConstants.PRODUCTS_PRODUCT_LOADED:

        newState.data = action.data;

        //Since for the API to detect children entity collection changes needs us to maintain their order
        //We have to use Maps for sensors and controls
        //That makes sure that by deleting something, we create a "hole" ina  sequence - preventing ID mix up on the backend
        //@TODO convert those 2 to map of records http://stackoverflow.com/questions/28639878/how-to-create-a-map-of-records-from-a-javascript-raw-object-with-immutable-js

        newState.product = new Product({
          id:           newState.data.id,
          name:         newState.data.name,
          shortname:    newState.data.shortname,
          platform:     Immutable.fromJS(newState.data.platform, function(k, v){
            if('' === k){
              return new Platform(v);
            }
            return v.toMap();
          }),
          organization:         newState.data.organization,
          isPublished:          newState.data.isPublished,
          isAtCommandMode:      newState.data.isAtCommandMode,
          doStartInStationMode: newState.data.doStartInStationMode,
          doLogWifiAp:          newState.data.doLogWifiAp,
          doLogWifiRssi:        newState.data.doLogWifiRssi,
          doLogWifiRfNoise:     newState.data.doLogWifiRfNoise,
          interface:            newState.data.interface,
          properties: Immutable.fromJS(action.data.properties, function(k,v){
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
          }),
          disabledIntegratedProperties: Immutable.fromJS(newState.data.disabledIntegratedProperties, function(k,v){
            if('' === k) return v.map((property) => {
              if(property.get('id') != undefined){
                return property.get('id');
              }
            }).toSet();
            return v;
          }),
          photoFileUri:          newState.data.photoFileUri,
          iconFileUri:           newState.data.iconFileUri,
          defaultApSsid:         newState.data.defaultApSsid,
          defaultApKey:          newState.data.defaultApKey,
          defaultApSecurityMode: newState.data.defaultApSecurityMode,
          wifiScanTime:          newState.data.wifiScanTime,
          wifiScanPeriod:        newState.data.wifiScanPeriod,
          wifiDoScanOnSchedule:  newState.data.wifiDoScanOnSchedule,
          wifiDoScanAtTime:      newState.data.wifiDoScanAtTime,
          wifiDoReportWifiScan:  newState.data.wifiDoReportWifiScan,
          wifiDoScanForBestAP:   newState.data.wifiDoScanForBestAP,
          doScanForBleThings:    newState.data.doScanForBleThings,
          doReportBleThings:     newState.data.doReportBleThings,
        });
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_LOAD_END:
        newState.isLoading = false;
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_DELETED:
        newState = this.getInitialState();
        newState.alerts.push({level: 'success', messageText: 'Product has been deleted'});
        return newState;
        break;

      //EDIT FORM
      case ProductConstants.PRODUCTS_PRODUCT_FORM_CREATE:
        newState = this.getInitialState();
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_EDIT_START:
        newState.draft = newState.product;
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_CHANGED:
        return ((newState) => {

          const propertyName = action.data.name;
          const newValue     = action.data.newValue;
          const oldValue     = action.data.oldValue;

          switch(propertyName){
            //Platform field is an entity on itself - so requires some special treatment
            case 'platform':
              if(newValue != oldValue){
                let selectedPlatform = newState.platforms.find(function(v){
                  if(v.get('id') == newValue) return true;
                });
                if(selectedPlatform){
                  newState.draft = newState.draft.set('platform', selectedPlatform);
                }
              }
              break;
            default:
              if(newValue != oldValue){
                newState.draft = newState.draft.set(propertyName, newValue);
              }
              break;
          }
          return newState;
        })(newState);
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_CHILDREN_INTEGRATED_DISABLED_CHANGED:
        return ((newState) => {

          //If the doDisable is set to true - we try to add the ID to the array of disabled ones
          //If it's set to false - we remove that ID
          const childId    = action.data.childId;
          const doDisable  = action.data.doDisable;

          let newDisabledIntegratedPropertiesSet = newState.draft.get('disabledIntegratedProperties');

          if(true === doDisable){
            newDisabledIntegratedPropertiesSet = newDisabledIntegratedPropertiesSet.add(childId);
          } else {
            newDisabledIntegratedPropertiesSet = newDisabledIntegratedPropertiesSet.remove(childId);
          }

          newState.draft = newState.draft.set('disabledIntegratedProperties', newDisabledIntegratedPropertiesSet);

          return newState;

        })(newState);
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_DISCARD:
        newState.draft = newState.product;
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_SAVE_START:
        newState.isLoading = true;
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_SAVE_SUCCESS:
        newState.alerts = [{level: 'success', messageText: 'Your product has been successfully saved'}];
        newState.product = newState.draft;
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_SAVE_END:
        newState.isLoading = false;
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_INVALID:
        newState.isLoading = false;
        newState.alerts = [];
        let invalidFields = action.data.errors;
        if(invalidFields.length > 0){
          invalidFields.map((invalidField) => {
            let messages = invalidField.errors || [];
            let alertMessage = messages.join("<br/>");
            newState.alerts.push({level: 'warning', messageText: alertMessage});
          })
        }
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_ERROR:
        newState.isLoading = false;
        newState.alerts = [{level: 'danger', messageText: action.error}];
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_EDIT_END:
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_CHILDREN_EDIT_DISCARD:
        newState.isEditingProperty  = false;
        newState.editingPropertyKey = null;
        return newState;
        break;

      //*****************
      //PROPERTIES
      //*****************
      case ProductConstants.PRODUCTS_PRODUCT_FORM_PROPERTY_CREATE:
        return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_PROPERTY_REMOVE:
          newState.draft = newState.draft.deleteIn(['properties', action.key]);
          return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_PROPERTY_EDIT_START:
          newState.isEditingProperty  = true;
          newState.editingPropertyKey = action.key;
          return newState;
        break;

      case ProductConstants.PRODUCTS_PRODUCT_FORM_PROPERTY_SAVE:
        return ((newState) => {

          const propertyDraft = action.property;
          const propertyKey   = Number.isInteger(action.key) ? action.key : newState.draft.get('properties').size + 1;

          newState.draft      = newState.draft.setIn(['properties', propertyKey], propertyDraft);
          newState.isEditingProperty  = false;
          newState.editingPropertyKey = null;
          return newState;
        })(newState);
        break;

      case AuthConstants.AUTH_LOGOUT:
        return this.getInitialState();
        break;

      default:
        return state;

    }

  }
}

export default new ProductStore();
