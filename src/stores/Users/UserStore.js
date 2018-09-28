import AppDispatcher  from 'dispatcher';
import AuthConstants  from 'constants/actions/Auth';
import UserConstants  from 'constants/actions/Users/User';
import {ReduceStore}  from 'flux/utils';
import User           from 'entities/User';
import Immutable      from 'immutable'

class UserStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  hasChanged(){
    const state = this.getState();
    return !(true === Immutable.is(state.draft,state.user));
  }

  getInitialState(){
    let defaultState = {
      user: new User(),
      draft: new User(),
      alerts: []
    };
    return defaultState;
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      // LOADING etc
      case UserConstants.USERS_USER_LOAD_START:
        newState.isLoading = true;
        newState.alerts = [];
        return newState;
        break;

      case UserConstants.USERS_USER_LOADED:
        newState.data = action.data;
        newState.user = new User({
          name:               newState.data.name,
          phone:              newState.data.phone,
          organization:       newState.data.organization,
          email:              newState.data.email,
          username:           newState.data.username,
          stSsid:             newState.data.stSsid,
          stKey:              newState.data.stKey,
          stSecurityMode:     newState.data.stSecurityMode
        });
        return newState;
        break;

      case UserConstants.USERS_USER_LOAD_END:
        newState.isLoading = false;
        return newState;
        break;

      case UserConstants.USERS_USER_FORM_CREATE:
        newState = this.getInitialState();
        return newState;
        break;

      case UserConstants.USERS_USER_FORM_EDIT_START:
        newState.draft = newState.user;
        return newState;
        break;

      case UserConstants.USERS_USER_FORM_CHANGED:
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

      case UserConstants.USERS_USER_FORM_DISCARD:
        newState.draft = newState.user;
        return newState;
        break;

      case UserConstants.USERS_USER_FORM_SAVE_START:
        newState.isLoading = true;
        return newState;
        break;

      case UserConstants.USERS_USER_FORM_SAVE_SUCCESS:
        newState.alerts = [{level: 'success', messageText: 'Your settings have been saved'}];
        newState.user = newState.draft;
        return newState;
        break;

      case UserConstants.USERS_USER_FORM_SAVE_END:
        newState.isLoading = false;
        return newState;
        break;

      case UserConstants.USERS_USER_ERROR:
        newState.isLoading = false;
        newState.alerts = [{level: 'danger', messageText: action.error}];
        return newState;
        break;

      case UserConstants.USERS_USER_INVALID:
        newState.isLoading = false;
        newState.alerts = [];
        let invalidGroups = action.data;
        if(invalidGroups.length > 0){
          invalidGroups.map((invalidGroup) => {
            let messages     = invalidGroup.errors || [];
            let alertMessage = messages.join('<br/>');
            newState.alerts.push({level: 'warning', messageText: alertMessage});
          })
        }
        return newState;
        break;

      case UserConstants.USERS_USER_FORM_EDIT_END:
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

export default new UserStore();
