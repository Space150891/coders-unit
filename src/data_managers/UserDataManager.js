import config               from 'config';
import DataManager          from 'data_managers/DataManager';

class UserDataManager extends DataManager{

  constructor(){
    super();
  }

  loadCurrent(){
    return  this.doGet(`${config.apiRoot}/users/current`);
  }

  updateCurrent(userSubmission){
    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPut(`${config.apiRoot}/users/current`, userSubmission, options);
  }

  /**
   * @param email - user email
   * @returns {*}
   */
  sendPasswordResetRequest(email){
    let data = new FormData();
    data.append('email', email);

    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};

    return  this.doPost(`${config.apiRoot}/users/resetting/request`, data, options);
  }

  /**
   * @param passwordResetSubmission
   * @param token - the token that comes from the email user receives
   * @returns {*}
   */
  reset(passwordResetSubmission, token){
    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPost(`${config.apiRoot}/users/resetting/reset/${token}`, passwordResetSubmission, options);
  }

}

export default new UserDataManager();
