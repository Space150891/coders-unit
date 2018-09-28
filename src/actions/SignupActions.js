import _                  from 'lodash';
import AppDispatcher      from 'dispatcher';
import SignupConstants    from 'constants/actions/Signup';
import axios              from 'axios';
import Q                  from 'q';
import config             from 'config';

export default {

  signup: (userSubmission) => {

    AppDispatcher.dispatch({
      actionType: SignupConstants.SIGNUP_START
    });

    Q(axios.post(`${config.apiRoot}/users/register`, userSubmission, {params: {
      'XDEBUG_SESSION_START':'PHPSTORM'
    }})).then( () => {

        AppDispatcher.dispatch({
          actionType: SignupConstants.SIGNUP_SUCCESS
        });

    }).finally(() => {

      //Indicates that we are done, fired on any outcome
      AppDispatcher.dispatch({actionType: SignupConstants.SIGNUP_END});

    }).catch(err => {

        let statusCode = _.get(err, ['response', 'status'], null);

        switch(statusCode){
          case 400:
              AppDispatcher.dispatch({
              actionType: SignupConstants.SIGNUP_INVALID,
              error: 'Please review the messages below',
              data: _.get(err, ['response', 'data'], [])
            });
          break;
          default:
            AppDispatcher.dispatch({
              actionType: SignupConstants.SIGNUP_FAILURE,
              error: 'An unexpected error occurred. Please try again later.'
            });
            break;
        }
    });

  },

  formValueChange(name, oldValue, newValue){
    AppDispatcher.dispatch({
      actionType: SignupConstants.SIGNUP_FORM_CHANGED,
      data: {
        name: name,
        oldValue: oldValue,
        newValue: newValue
      }
    });
  },

  termsAndConditionsAcceptance(document, newValue){
    AppDispatcher.dispatch({
      actionType: SignupConstants.SIGNUP_TERMS_AND_CONDITIONS_ACCEPTANCE_CHANGED,
      data: {
        document: document,
        newValue: newValue
      }
    });
  }

}
