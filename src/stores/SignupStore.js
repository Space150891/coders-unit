import _               from 'lodash';
import Immutable       from 'immutable';
import AppDispatcher   from 'dispatcher';
import SignupConstants from 'constants/actions/Signup';
import {ReduceStore}   from 'flux/utils';
import UserRegistrationSubmission  from 'data_managers/submissions/UserRegistrationSubmission';
import ThemeVars       from 'theme_vars';

class SignupStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  getInitialState(){
    return {
      userSubmission:   new UserRegistrationSubmission().set('organization', ThemeVars.organizationId),
      isLoading:        false,
      termsAndConditionsAcceptance: Immutable.Record({terms: false, description: false})(),
      inputsValidity:   {},
      alerts:           []
    }
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      case SignupConstants.SIGNUP_START:
        newState.isLoading = true;
        return newState;
        break;

      case SignupConstants.SIGNUP_FORM_CHANGED:
        return ((newState) => {

          const propertyName = action.data.name;
          const newValue     = action.data.newValue;
          const oldValue     = action.data.oldValue;

          if(newValue != oldValue){
              newState.userSubmission = newState.userSubmission.set(propertyName, newValue);
          }

          return newState;

        })(newState);
        break;

      case SignupConstants.SIGNUP_TERMS_AND_CONDITIONS_ACCEPTANCE_CHANGED:
        newState.termsAndConditionsAcceptance = newState.termsAndConditionsAcceptance.set(action.data.document, action.data.newValue);
        return newState;
        break;

      case SignupConstants.SIGNUP_SUCCESS:
        newState = this.getInitialState();
        newState.alerts = [{level: 'success', messageText: 'Your account has been created'}];
        return newState;
        break;

      case SignupConstants.SIGNUP_INVALID:
        let inputsValidity = {};
        const errorMessages = Array.isArray(action.data) ? action.data : [action.data];
        errorMessages.map((errorData) => {
          inputsValidity[_.get(errorData, ['name'], '__common')] = {
            status: 'error',
            messages: _.get(errorData, ['errors'], [new String(errorData)])
          }
        });
        newState.inputsValidity = inputsValidity;
        newState.alerts = [];
        return newState;
        break;

      case SignupConstants.SIGNUP_FAILURE:
        newState.alerts = [{level: 'danger', messageText: action.error}];
        return newState;
        break;

      case SignupConstants.SIGNUP_END:
        newState.isLoading = false;
        return newState;
        break;

      default:
        return newState;
    }

  }

}

export default new SignupStore();
