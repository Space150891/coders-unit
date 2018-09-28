import AppDispatcher  from 'dispatcher';
import AuthConstants  from 'constants/actions/Auth';
import ThingConstants from 'constants/actions/Things/Thing';
import {ReduceStore}  from 'flux/utils';
import Thing          from 'entities/Thing';
import Product        from 'entities/Product';
import Immutable      from 'immutable'

class ThingStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  hasChanged(){
    const state = this.getState();
    return !(true === Immutable.is(state.draft,state.thing));
  }

  getInitialState(){
    let defaultState = {
      groups:   new Immutable.List(), //tree
      products: new Immutable.List(),
      data: {
        properties: {}
      },
      thing: new Thing(),
      draft: new Thing(),
      alerts: []
    };
    return defaultState;
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      // LOADING etc
      case ThingConstants.THINGS_THING_LOAD_START:
        newState.isLoading = true;
        newState.alerts = [];
        return newState;
        break;

      case ThingConstants.THINGS_THING_FORM_GROUPS_TREE_LOADED:
        newState.groups = new Immutable.List(action.data);
        return newState;
        break;

      case ThingConstants.THINGS_THING_FORM_PRODUCTS_LOADED:
        return ((newState) => {
          let products = new Immutable.List();
          action.data.map((productData) => {
            products = products.push(new Product(productData));
          });
          newState.products = products;
          return newState;
        })(newState)
        break;

      case ThingConstants.THINGS_THING_LOADED:
        newState.data = action.data;
        newState.thing = new Thing({
          id:      newState.data.id,
          sn:      newState.data.sn,
          name:    newState.data.name,
          product: newState.data.product,
          group:   newState.data.group
        });
        return newState;
        break;

      case ThingConstants.THINGS_THING_LOAD_END:
        newState.isLoading = false;
        return newState;
        break;

      case ThingConstants.THINGS_THING_DELETED:
        newState = this.getInitialState();
        newState.alerts.push({level: 'success', messageText: 'Product has been deleted'});
        return newState;
        break;

      //EDITING product itself
      case ThingConstants.THINGS_THING_FORM_CREATE:
        newState = this.getInitialState();
        return newState;
        break;

      case ThingConstants.THINGS_THING_FORM_EDIT_START:
        newState.draft = newState.thing;
        return newState;
        break;

      case ThingConstants.THINGS_THING_FORM_CHANGED:
        return ((newState) => {
          const propertyName = action.data.name;
          const newValue     = action.data.newValue;
          const oldValue     = action.data.oldValue;
          if(newValue != oldValue){
            newState.draft = newState.draft.set(propertyName, newValue);
          }
          return newState;
        })(newState);
        break;

      case ThingConstants.THINGS_THING_FORM_RESET:
        return ((newState) => {
          newState.draft = new Thing();
          newState.thing = new Thing();

          return newState;
        })(newState);
        break;

      case ThingConstants.THINGS_THING_FORM_DISCARD:
        newState.draft = newState.thing;
        return newState;
        break;

      case ThingConstants.THINGS_THING_FORM_SAVE_START:
        newState.isLoading = true;
        return newState;
        break;

      case ThingConstants.THINGS_THING_FORM_SAVE_SUCCESS:
        newState.alerts = [{level: 'success', messageText: 'Your thing has been successfully saved'}];
        newState.thing = newState.draft;
        return newState;
        break;

      case ThingConstants.THINGS_THING_FORM_SAVE_END:
        newState.isLoading = false;
        return newState;
        break;

      case ThingConstants.THINGS_THING_INVALID:
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

      case ThingConstants.THINGS_THING_ERROR:
        newState.isLoading = false;
        newState.alerts = [{level: 'danger', messageText: action.error}];
        return newState;
        break;

      case ThingConstants.THINGS_THING_FORM_EDIT_END:
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
