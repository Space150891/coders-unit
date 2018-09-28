import config               from 'config';
import DataManager          from 'data_managers/DataManager';

class PlatformDataManager extends DataManager{

  constructor(){
    super();
  }

  loadPlatforms(){
    return  this.doGet(`${config.apiRoot}/platforms`);
  }

  create(platformSubmission){
    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPost(`${config.apiRoot}/platforms/`, platformSubmission, options);
  }

  load(id){
    return  this.doGet(`${config.apiRoot}/platforms/${id}`);
  }

  update(id, platformSubmission){
    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPut(`${config.apiRoot}/platforms/${id}`, platformSubmission, options);
  }

  delete(id){
    return  this.doDelete(`${config.apiRoot}/platforms/${id}`);
  }

}

export default new PlatformDataManager();

