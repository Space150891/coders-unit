import config               from 'config';
import DataManager          from 'data_managers/DataManager';

class ProductDataManager extends DataManager{

  constructor(){
    super();
  }

  loadAll(){
    return  this.doGet(`${config.apiRoot}/products`);
  }

  create(productSubmission){
    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPost(`${config.apiRoot}/products/`, productSubmission, options);
  }

  load(id){
    return  this.doGet(`${config.apiRoot}/products/${id}`);
  }

  update(id, productSubmission){
    let options = this.getOptions();
    options.headers = {'Content-Type': 'application/json'};
    return  this.doPut(`${config.apiRoot}/products/${id}`, productSubmission, options);
  }

  delete(id){
    return  this.doDelete(`${config.apiRoot}/products/${id}`);
  }

  getSourcesDownloadUrl(id){
    if(!id) throw new Error('No id was provided');
    const options = this.getOptions();
    return  `${config.apiRoot}/products/${id}/sources?access_token=` + options.params.access_token;
  }

}

export default new ProductDataManager();

