import AppDispatcher      from 'dispatcher';
import {ReduceStore}      from 'flux/utils';
import AuthConstants      from 'constants/actions/Auth';
import NavigatorConstants from 'constants/actions/Products/Navigator';

class NavigatorStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  getInitialState(){
    return  {
      isLoading: true,
      data: [],
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
        newState.data = action.data;
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
