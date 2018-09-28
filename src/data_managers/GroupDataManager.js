import config      from 'config';
import DataManager from 'data_managers/DataManager';

class GroupDataManager extends DataManager{

  constructor(){
    super();
  }

  loadTree(){
    return  this.doGet(`${config.apiRoot}/groups`);
  }

  loadChildren(parentId){
    return  this.doGet(`${config.apiRoot}/groups/${parentId}/children`);
  }

  loadThings(parentId){
    return  this.doGet(`${config.apiRoot}/groups/${parentId}/things`);
  }

  loadProducts(id){
    return this.doGet(`${config.apiRoot}/groups/${id}/products`);
  }

  loadPropertyHistory(id, productId, propertyId, timestampFrom, timestampTo){
    return this.doGet(`${config.apiRoot}/groups/${id}/products/${productId}/properties/${propertyId}/history/${timestampFrom}/${timestampTo}`);
  }

  create(groupSubmission){
    const options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPost(`${config.apiRoot}/groups/`, groupSubmission, options);
  }

  load(id){
    return  this.doGet(`${config.apiRoot}/groups/${id}`);
  }

  update(id, groupSubmission){
    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPut(`${config.apiRoot}/groups/${id}`, groupSubmission, options);
  }

  delete(id){
    return  this.doDelete(`${config.apiRoot}/groups/${id}`);
  }

}

export default new GroupDataManager();

