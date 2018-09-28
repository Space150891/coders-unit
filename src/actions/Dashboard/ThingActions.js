import Q                  from 'q';
import config             from 'config';
import AppDispatcher      from 'dispatcher';
import ThingConstants     from 'constants/actions/Dashboard/Thing';
import ThingDataManager   from 'data_managers/ThingDataManager';

class ThingActions {

  changeLiveUpdates(val) {
    AppDispatcher.dispatch({
      actionType: ThingConstants.THING_LIVE_UPDATES_CHANGE,
      data: {
        doLiveUpdate: val
      }
    });
  }

  /**
   * @param id
   */
  loadThing(id){
    return ThingDataManager.load(id)
      .then((response) => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THING_LOADED,
          data: response.data
        });
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THING_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      });
  }

  /**
   * @param id
   */
  loadProduct(id){
      return ThingDataManager.load(id)
      .then((response) => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THING_PRODUCT_LOADED,
          data: response.data
        });
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THING_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      });
  }

  /**
   * @param id
   * @returns {*|Promise<R>|Promise.<T>}
   */
  loadProperties(id) {

    return  ThingDataManager.loadProperties(id)
      .then((response) => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THING_DEFINITIONS_LOADED,
          data: {
            id: id,
            propertiesData: response.data
          }
        });
        //We may want to chain actions - so need to also return the results
        return response.data;
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THING_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      });

  }

  /**
   * @param id
   * @returns {*|Promise<R>|Promise.<T>}
   */
  loadReadings(id) {

    return Q.all([
      ThingDataManager.loadReadings(id),
      ThingDataManager.loadErrors(id)
    ])
      .spread((readingsResponse, errorsResponse) => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THING_READINGS_LOADED,
          data: {
            id: id,
            readingsData: readingsResponse.data,
            errorsData: errorsResponse.data
          }
        });
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THING_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      });

  }

  load(id) {

    AppDispatcher.dispatch({
      actionType: ThingConstants.THING_LOAD_START
    });

    //@TODO Do first item load somewhere around here
    return this
      .loadThing(id)
      .then(() => {return this.loadProduct(id)})
      .then(() => {return this.loadProperties(id)})
      .then(() => {return this.loadReadings(id)})
      .finally(() => {
        AppDispatcher.dispatch({actionType: ThingConstants.THING_LOAD_END});
      });
  }

}

export default new ThingActions();
