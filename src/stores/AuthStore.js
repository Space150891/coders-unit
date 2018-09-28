import AppDispatcher from 'dispatcher';
import AuthConstants from 'constants/actions/Auth';
import {ReduceStore} from 'flux/utils';
import { browserHistory } from 'react-router';

class AuthStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  getInitialState(){
    let defaultState = {
      accessToken:                null,
      refreshToken:               null,
      tokenLifetime:              null,
      tokenReceivedTime:          null,
      scopes:                     [],
      isLoading:                  false,
      credentialsValidationState: null,
      alerts:                     []
    }
    let localState = this.loadLocalState();
    return Object.assign(defaultState, localState);
  }

  isAuthenticated() {
    if (this._isTokenValid()) {
      return true;
    }
    return false;
  }

  _isTokenValid(){
    let state = this.getState();
    if (state.accessToken) {
      if(this._getCurrentTsUnix() < (state.tokenReceivedTime + state.tokenLifetime)){
        return true;
      }
    }
    return false;
  }

  getAccessToken() {
    return this.getState().accessToken;
  }

  getRefreshToken() {
    return this.getState().refreshToken;
  }

  saveLocalState(state){

    //Only the elements with the keys like in this array will be preserved in the local state
    const  locallyStoredStateElements = [
      'accessToken',
      'refreshToken',
      'tokenLifetime',
      'tokenReceivedTime',
      'scopes'
    ];

    let storedState = {};
    locallyStoredStateElements.forEach((v) => {
      storedState[v] = state[v];
    });

    localStorage.setItem('auth_store', JSON.stringify(storedState));
  }

  loadLocalState(){
    let storedState = localStorage.getItem('auth_store');
    try{
      return JSON.parse(storedState);
    } catch(err){
      return false;
    }
  }

  clearLocalState(){
    localStorage.removeItem('auth_store');
  }

  _getCurrentTsUnix(){
    return Math.floor(+ new Date() / 1000);
  }

  _logout(){
    this.clearLocalState();
    //Login component doesn't do any initial load
    //That's why it is OK to do redirecting here and not in the action creator like in most other cases
    browserHistory.push('/login');
    return this.getInitialState();
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      case AuthConstants.AUTH_START:
        newState.isLoading = true;
        return newState;
        break

      case AuthConstants.AUTH_SUCCESS:
        newState.accessToken       = action.data.access_token;
        newState.refreshToken      = action.data.refresh_token;
        newState.tokenLifetime     = action.data.expires_in;
        newState.tokenReceivedTime = this._getCurrentTsUnix();
        newState.scope             = action.data.scope;
        return newState;
        break

      case AuthConstants.AUTH_ERROR:
        newState.credentialsValidationState = 'error';
        newState.alerts = [{level: 'warning', messageText: action.error}];
        return newState;
        break

      case AuthConstants.AUTH_FAILURE:
        newState.alerts = [{level: 'danger', messageText: action.error}];
        return newState;
        break

      case AuthConstants.AUTH_LOGOUT:
        if(this.isAuthenticated()){
          return this._logout();
        } else {
          newState.alerts = [{level: 'warning', messageText: 'You are not logged in'}];
          return state;
        }
        break

      case AuthConstants.AUTH_END:
        newState.isLoading = false;
        this.saveLocalState(newState);
        return newState;
        break

      /**
       * @TODO
       * Implement dispatching
       * Use refresh token to obtain the new access token here
       */
      case AuthConstants.AUTH_TOKEN_OBSOLETE:
        return this._logout();
        break

      default:
        //SILVER BULLET
        //No matter what action it is
        //This operation goes to default so it does not prevent auth related action from being executed
        //We want to redirect to login if token is not good, but need to make sure that we were logged in in the first place
        if(state.accessToken && !this._isTokenValid()){
          return this._logout();
        }
        return state;
    }

  }

}

export default new AuthStore();
