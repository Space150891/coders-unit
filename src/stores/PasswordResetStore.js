import _                        from 'lodash';
import AppDispatcher            from 'dispatcher';
import {ReduceStore}            from 'flux/utils';
import PasswordResetConstants   from 'constants/actions/PasswordReset';
import PasswordResetSubmission  from 'data_managers/submissions/PasswordResetSubmission';

class PasswordResetStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  getInitialState(){
    return {
      passwordResetSubmission: new PasswordResetSubmission(),
      email:           '',
      token:           '',
      isLoading:       false,
      inputsValidity:  {},
      alerts:          []
    }
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      case PasswordResetConstants.PASSWORD_RESET_REQUEST_START:
      case PasswordResetConstants.PASSWORD_RESET_START:
        newState.isLoading = true;
        return newState;
        break;

      case PasswordResetConstants.PASSWORD_RESET_FORM_CHANGED:
        return ((newState) => {

          const propertyName = action.data.name;
          const newValue     = action.data.newValue;

          switch(propertyName){
            case 'email':
              newState.email = newValue;
              break;
            case 'token':
              newState.token = newValue;
              break;
            case 'plainPassword':
              newState.passwordResetSubmission = newState.passwordResetSubmission.set(propertyName, newValue);
            break;
          }

          return newState;

        })(newState);
        break;

      case PasswordResetConstants.PASSWORD_RESET_REQUEST_SUCCESS:
        newState.alerts = [{level: 'success', messageText: 'Please check your inbox'}];
        newState.inputsValidity = {};
        return newState;
        break;

      case PasswordResetConstants.PASSWORD_RESET_SUCCESS:
        newState = this.getInitialState();
        newState.alerts = [{level: 'success', messageText: 'Your new password has been set'}];
        newState.inputsValidity = {};
        return newState;
        break;

      case PasswordResetConstants.PASSWORD_RESET_INVALID:
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

      case PasswordResetConstants.PASSWORD_RESET_FAILURE:
        newState.alerts = [{level: 'danger', messageText: action.error}];
        return newState;
        break;

      case PasswordResetConstants.PASSWORD_RESET_REQUEST_END:
      case PasswordResetConstants.PASSWORD_RESET_END:
        newState.isLoading = false;
        return newState;
        break;

      default:
        return newState;
    }

  }

}

export default new PasswordResetStore();
