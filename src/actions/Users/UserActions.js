import config          from 'config';
import AppDispatcher   from 'dispatcher';
import UserConstants   from 'constants/actions/Users/User';
import UserDataManager from 'data_managers/UserDataManager';
import UserSubmission  from 'data_managers/submissions/UserSubmission';
import _ from 'lodash';

class UserActions {

  loadCurrent() {

    AppDispatcher.dispatch({
      actionType: UserConstants.USERS_USER_LOAD_START
    });

    return UserDataManager.loadCurrent()
      .then((response) => {
        let data = response.data;
        AppDispatcher.dispatch({
          actionType: UserConstants.USERS_USER_LOADED,
          data: data
        });
      })
      .finally(() => {
        AppDispatcher.dispatch({actionType: UserConstants.USERS_USER_LOAD_END});
      })
      .catch((err) => {
        AppDispatcher.dispatch({
          actionType: UserConstants.USERS_USER_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error while trying to load user data'
        });
      });
  }

  formEditStart(id) {
    //id == null means that we're working with a new user
    //Otherwise it's an editing
    if (null !== id) {
      this.loadCurrent().then(() => {
        AppDispatcher.dispatch({
          actionType: UserConstants.USERS_USER_FORM_EDIT_START
        });
      });
    } else {
      AppDispatcher.dispatch({
        actionType: UserConstants.USERS_USER_FORM_EDIT_START
      });
    }
  }

  formValueChange(name, oldValue, newValue) {
    AppDispatcher.dispatch({
      actionType: UserConstants.USERS_USER_FORM_CHANGED,
      data: {
        name: name,
        oldValue: oldValue,
        newValue: newValue
      }
    });
  }

  formSave(draft) {

    let promise = {};

    const submission = new UserSubmission(draft);

    promise =
      UserDataManager
        .updateCurrent(submission)
        .then(function () {
          return this.loadCurrent();
        }.bind(UserDataManager));

    AppDispatcher.dispatch({
      actionType: UserConstants.USERS_USER_FORM_SAVE_START
    });

    promise
      .then((response) => {

        AppDispatcher.dispatch({
          actionType: UserConstants.USERS_USER_FORM_SAVE_SUCCESS
        });

        //Make sure we supply a newly returned user to the UI
        let data = response.data;

        AppDispatcher.dispatch({
          actionType: UserConstants.USERS_USER_LOADED,
          data: data
        });

        //The product we've just loaded will live in product property of the productStore state
        //The next action will copy it to draft thus making available for edit
        AppDispatcher.dispatch({
          actionType: UserConstants.USERS_USER_FORM_EDIT_START
        });

      })
      .finally(() => {
        AppDispatcher.dispatch({
          actionType: UserConstants.USERS_USER_FORM_SAVE_END
        });
      })
      .catch((err) => {

        let code = _.get(err, ['response', 'status'], null);
        let data = _.get(err, ['response', 'data'], []);

        switch (code) {
          case 400:
            AppDispatcher.dispatch({
              actionType: UserConstants.USERS_USER_INVALID,
              data: data
            });
            break;
          default:
            console.error(err);
            AppDispatcher.dispatch({
              actionType: UserConstants.USERS_USER_ERROR,
              error: err.message
            });
            break;
        }
      })
  }

  formDiscard() {
    AppDispatcher.dispatch({
      actionType: UserConstants.USERS_USER_FORM_DISCARD
    });
  }

}

export default new UserActions();
