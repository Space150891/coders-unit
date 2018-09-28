import _                      from 'lodash';
import AppDispatcher          from 'dispatcher';
import PasswordResetConstants from 'constants/actions/PasswordReset';
import UserDataManager        from 'data_managers/UserDataManager';

function handleError(err){

  let statusCode = _.get(err, ['response', 'status'], null);

  switch(statusCode){
    case 400:
      AppDispatcher.dispatch({
        actionType: PasswordResetConstants.PASSWORD_RESET_INVALID,
        error: 'Please review the messages below',
        data: _.get(err, ['response', 'data'], [])
      });
      break;
    default:
      AppDispatcher.dispatch({
        actionType: PasswordResetConstants.PASSWORD_RESET_FAILURE,
        error: 'An unexpected error occurred. Please try again later.'
      });
      break;
  }

}

export default {

  sendResetRequest: (email) => {

    AppDispatcher.dispatch({
      actionType: PasswordResetConstants.PASSWORD_RESET_REQUEST_START
    });

    UserDataManager.sendPasswordResetRequest(email).then(() => {

        AppDispatcher.dispatch({
          actionType: PasswordResetConstants.PASSWORD_RESET_REQUEST_SUCCESS
        });

    }).finally(() => {

      //Indicates that we are done, fired on any outcome
      AppDispatcher.dispatch({actionType: PasswordResetConstants.PASSWORD_RESET_REQUEST_END});

    }).catch(err => {
        handleError(err);
    });

  },

  reset: (passwordResetSubmission, token) => {

    AppDispatcher.dispatch({
      actionType: PasswordResetConstants.PASSWORD_RESET_START
    });

    UserDataManager.reset(passwordResetSubmission, token).then(() => {

      AppDispatcher.dispatch({
        actionType: PasswordResetConstants.PASSWORD_RESET_SUCCESS
      });

    }).finally(() => {

      //Indicates that we are done, fired on any outcome
      AppDispatcher.dispatch({actionType: PasswordResetConstants.PASSWORD_RESET_END});

    }).catch(err => {
      handleError(err);
    });


  },

  formValueChange(name, oldValue, newValue){
    AppDispatcher.dispatch({
      actionType: PasswordResetConstants.PASSWORD_RESET_FORM_CHANGED,
      data: {
        name: name,
        oldValue: oldValue,
        newValue: newValue
      }
    });
  }

}
