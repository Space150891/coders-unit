import config                 from 'config';
import AppDispatcher          from 'dispatcher';
import ThingHistoryConstants  from 'constants/actions/Dashboard/ThingHistory';
import ThingActions           from 'actions/Dashboard/ThingActions';
import ThingDataManager       from 'data_managers/ThingDataManager';

class ThingHistoryActions {

  changeLiveUpdates(val, interval) {
    AppDispatcher.dispatch({
      actionType: ThingHistoryConstants.THING_HISTORY_LIVE_UPDATES_CHANGED,
      data: {
        doLiveUpdate: val,
        liveUpdatesInterval: interval
      }
    });
  }

  changeSelectedTimestampFrom(TimestampFrom) {
    AppDispatcher.dispatch({
      actionType: ThingHistoryConstants.THING_HISTORY_SELECTED_TIMESTAMP_FROM_CHANGED,
      data: TimestampFrom
    });
  }

  changeSelectedTimestampTo(TimestampTo) {
    AppDispatcher.dispatch({
      actionType: ThingHistoryConstants.THING_HISTORY_SELECTED_TIMESTAMP_TO_CHANGED,
      data: TimestampTo
    });
  }

  /**
   * @param id
   * @param propertyId
   * @param timestampFrom
   * @param timestampTo
   * @returns {Promise.<T>|Promise<R>}
   */
  loadHistory(id, propertyId, timestampFrom, timestampTo){

    return ThingDataManager.loadPropertyHistory(id, propertyId, timestampFrom, timestampTo)
      .then((propertyHistoryResponse) => {
        AppDispatcher.dispatch({
          actionType: ThingHistoryConstants.THING_HISTORY_LOADED,
          data: {
            thingId:       id,
            propertyId:    propertyId,
            timestampFrom: timestampFrom,
            timestampTo:   timestampTo,
            historyData:   propertyHistoryResponse.data
          }
        });
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: ThingHistoryConstants.THING_HISTORY_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      });
  }


  loadHistories(id,  propertyIds, timestampFrom, timestampTo){

    const promises = propertyIds.map((propertyId) => {
      return ThingDataManager.loadPropertyHistory(id, propertyId, timestampFrom, timestampTo)
    });
    return Promise.all(promises).then((results) => {

      const data = results.map((e) => e.data);
      AppDispatcher.dispatch({
        actionType: ThingHistoryConstants.THING_HISTORY_LOADED,
        data: {
          thingId:       id,
          timestampFrom: timestampFrom,
          timestampTo:   timestampTo,
          historyData:   data,
          propertyIds:   propertyIds
        }
      });

      return promises;
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: ThingHistoryConstants.THING_HISTORY_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      });
  }

  load(id, propertyIds, timestampFrom, timestampTo) {

    AppDispatcher.dispatch({
      actionType: ThingHistoryConstants.THING_HISTORY_LOAD_START
    });
    return ThingActions.load(id)
      .then(() => ThingActions.loadProperties(id))
      .then((propertiesDataRecord) => {
        //If propertyId is null - we are doing the initial load
        //Try to get the id of the first property
        propertyIds = propertyIds || [propertiesDataRecord.shift().id];
        return this.loadHistories(id, propertyIds, timestampFrom, timestampTo)
      })
      .catch(err => {
        AppDispatcher.dispatch({
          actionType: ThingHistoryConstants.THING_HISTORY_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      })
      .finally(() => {
        AppDispatcher.dispatch({actionType: ThingHistoryConstants.THING_HISTORY_LOAD_END});
      });
  }

}

export default new ThingHistoryActions();
