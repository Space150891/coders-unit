import config      from 'config';
import DataManager from 'data_managers/DataManager';

class FileDataManager extends DataManager{

  constructor(){
    super();
  }

  create(file){
    const options = this.getOptions();

    let formData = new FormData();
    formData.append("file", file);

    options.headers = {'Content-Type': 'multipart/form-data'};
    return  this.doPost(`${config.apiRoot}/files/`, formData, options);
  }

  load(id){
    return  this.doGet(`${config.apiRoot}/files/${id}`);
  }

  delete(id){
    return  this.doDelete(`${config.apiRoot}/files/${id}`);
  }

}

export default new FileDataManager();

