import Q           from 'q';
import axios       from 'axios';
import _           from 'lodash';
import AuthStore   from 'stores/AuthStore';
import AuthActions from 'actions/AuthActions';

class DataManager {

  getOptions(){
    let options = {
      params: {
        'access_token': AuthStore.getAccessToken(),
        'XDEBUG_SESSION_START':'PHPSTORM',
        'timeout': 120000
      }
    }
    return Object.assign({}, options);
  }

  /**
   *
   * @param url
   * @param data
   * @param options
   * @returns {*}
   */
  doPost(url, data, options){
    return this.doRequest('post', url, data, options);
  }

  /**
   *
   * @param url
   * @param options
   * @returns {*}
   */
  doGet(url, options){
    return this.doRequest('get', url, options);
  }

  /**
   *
   * @param url
   * @param data
   * @param options
   * @returns {*}
   */
  doPut(url, data, options){
    return this.doRequest('put', url, data, options);
  }

  /**
   *
   * @param url
   * @param options
   * @returns {*}
   */
  doDelete(url, options){
    return this.doRequest('delete', url, options);
  }

  /**
   *
   * @param type
   * @param url
   * @param data
   * @param options
   */
  doRequest(type, url, data, options){

    type    = type    || 'get';
    options = options || this.getOptions();

    switch(type){
      case 'post':
        return  Q(axios.post(url, data, options)).catch(this.handleException);
        break;
      case 'get':
        return  Q(axios.get(url, options)).catch(this.handleException);
        break;
      case 'put':
        return Q(axios.put(url, data, options)).catch(this.handleException);
        break;
      case 'delete':
        return Q(axios.delete(url, options)).catch(this.handleException);
        break;
    }

  }

  loadFromUrl(url){
    const options = this.getOptions();
    return  Q(axios.get(url, options));
  }

  handleException(e){
    const statusCode = _.get(e, ['response', 'status'], null);
    if(statusCode != null){
      switch(statusCode){
        case 401:
          AuthActions.logout();
          break;
      }
    }
    //@TODO Add some logging stuff here
    throw e;
  }

}

export default DataManager;
