import AppDispatcher      from 'dispatcher';
import AuthConstants      from 'constants/actions/Auth';
import axios              from 'axios';
import Q                  from 'q';
import config             from 'config';
import { browserHistory } from 'react-router'

export default {

  login: (username, password) => {

      let options = {
        params: {
          'grant_type':    'password',
          'username':       username,
          'password':       password,
          'client_id':     config.apiClientId,
          'client_secret': config.apiClientSecret
        }
      }

      //Let dispatcher know that we're starting a login attempt
      AppDispatcher.dispatch({
        actionType: AuthConstants.AUTH_START
      });

      Q(axios.get(`${config.oauthRoot}/token`, options)).then(response => {

        let data = response.data;

        if(data.access_token && data.refresh_token){
          AppDispatcher.dispatch({
            actionType: AuthConstants.AUTH_SUCCESS,
            data:       data
          });
        } else {
          throw new Error(response);
        }

      }).then(() => {
        //Redirect is done here to avoid dispatching problems
        browserHistory.push('/');
      }).finally(() => {

          //Indicates that we are done, fired on any outcome
          AppDispatcher.dispatch({actionType: AuthConstants.AUTH_END});

      }).catch(err => {

        if(err.response && err.response.data){

          let data =  err.response.data;
          let error = data.error;

          switch(error){
            case 'invalid_grant':
              AppDispatcher.dispatch({
                actionType:   AuthConstants.AUTH_ERROR,
                error: 'Invalid credentials provided.'
              });
              break;
            case 'invalid_request':
              AppDispatcher.dispatch({
                actionType:   AuthConstants.AUTH_ERROR,
                error: 'Make sure you provide both username and password.'
              });
              break;
            default:
              //Errors not related with creds validity
              AppDispatcher.dispatch({
                actionType: AuthConstants.AUTH_FAILURE,
                error: 'We were unable to login, please try again later.'
              });
          }

        } else {
          //Connectivity errors etc.
          AppDispatcher.dispatch({
            actionType: AuthConstants.AUTH_FAILURE,
            error: 'An unexpected connectivity error occurred. Please try again later.'
          });
        }

      });

  },

  logout: () => {
    AppDispatcher.dispatch({
      actionType: AuthConstants.AUTH_LOGOUT
    });
  }

}
