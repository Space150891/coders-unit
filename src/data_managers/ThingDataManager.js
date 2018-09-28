import config      from 'config';
import DataManager from 'data_managers/DataManager';

class ThingDataManager extends DataManager{

  constructor(){
    super();
  }

  loadAll(){
    return  this.doGet(`${config.apiRoot}/things`);
  }

  create(thing){
    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPost(`${config.apiRoot}/things/`, thing, options);
  }

  load(id){
    return  this.doGet(`${config.apiRoot}/things/${id}`);
  }

  update(id, productSubmission){
    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPut(`${config.apiRoot}/things/${id}`, productSubmission, options);
  }

  delete(id){
    return  this.doDelete(`${config.apiRoot}/things/${id}`);
  }

  loadProduct(id){
    return  this.doGet(`${config.apiRoot}/things/${id}/product`);
  }

  loadReadings(id){
    return this.doGet(`${config.apiRoot}/things/${id}/readings`);
  }

  loadPropertyHistory(id, propertyId, timestampFrom, timestampTo){
    return this.doGet(`${config.apiRoot}/things/${id}/properties/${propertyId}/history/${timestampFrom}/${timestampTo}`);
  }

  loadProperties(id){
    return this.doGet(`${config.apiRoot}/things/${id}/properties`);
  }

  loadErrors(id){
    return this.doGet(`${config.apiRoot}/things/${id}/properties/errors`);
  }

}

export default new ThingDataManager();

