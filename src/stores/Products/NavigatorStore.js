import AppDispatcher      from 'dispatcher';
import {ReduceStore}      from 'flux/utils';
import Immutable          from 'immutable';
import AuthConstants      from 'constants/actions/Auth';
import NavigatorConstants from 'constants/actions/Products/Navigator';
import Product            from 'entities/Product';

class NavigatorStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  getInitialState(){
    return  {
      isLoading: true,
      products: new Immutable.Map(),
      error: null
    }
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      case NavigatorConstants.PRODUCTS_NAVIGATOR_LOAD_START:
        newState.isLoading = true;
        return newState;
        break;

      case NavigatorConstants.PRODUCTS_NAVIGATOR_LIST_LOADED:
        newState.error = null;
        newState.products = Immutable.fromJS(action.data, function(k,v){
          if('' === k) return v.toMap();
          if(v.get('id') != undefined) return new Product(v);
          return v;
        });
        return newState;
        break;

      case NavigatorConstants.PRODUCTS_NAVIGATOR_LOAD_END:
        newState.isLoading = false;
        return newState;
        break;

      case NavigatorConstants.PRODUCTS_NAVIGATOR_LOAD_ERROR:
        newState.isLoading = false;
        newState.error = action.error || null;
        return newState;
        break;

      case AuthConstants.AUTH_LOGOUT:
        return this.getInitialState();
        break;

      default:
        return state;
        break;
    }

  }

}

export default new NavigatorStore();
