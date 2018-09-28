import Q                  from 'q';
import config             from 'config';
import AppDispatcher      from 'dispatcher';
import NavigatorConstants from 'constants/actions/Dashboard/Navigator';
import ThingDataManager   from 'data_managers/ThingDataManager';
import ProductDataManager from 'data_managers/ProductDataManager';
import GroupDataManager   from 'data_managers/GroupDataManager';

export default {

  loadThingsList: () => {

      AppDispatcher.dispatch({
        actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_CHANGE_START,
        mode:       NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS
      });

      Q.all([
        ProductDataManager.loadAll(),
        ThingDataManager.loadAll()
      ]).spread((productsResponse, thingsResponse) => {

        AppDispatcher.dispatch({
          actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_PRODUCTS_LOADED,
          data: productsResponse.data
        });

        AppDispatcher.dispatch({
          actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_LIST_LOADED,
          mode:       NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS,
          data:       thingsResponse.data
        });

      }).finally(() => {

        AppDispatcher.dispatch({actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_CHANGE_END});

      }).catch(err => {

        AppDispatcher.dispatch({
          actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_ERROR,
          error:      config.isDev() ? err.message : 'We have encountered an error'
        });

      });

  },

  loadGroupsList: () => {

    AppDispatcher.dispatch({
      actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_CHANGE_START,
      mode:       NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_GROUPS
    });

    GroupDataManager.loadTree().then(response => {

      let data = response.data;

      AppDispatcher.dispatch({
        actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_LIST_LOADED,
        mode:       NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_GROUPS,
        data:       data
      });

    }).finally(() => {

      AppDispatcher.dispatch({actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_CHANGE_END});

    }).catch(err => {

      AppDispatcher.dispatch({
        actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_ERROR,
        error:      config.isDev() ? err.message : 'We have encountered an error'
      });

    });

  },

  sort: (orderBy, order) => {
    //Order can be either 1 or -1
    order = (1 === order || -1 === order) ? order : 1;
    AppDispatcher.dispatch({
      actionType: NavigatorConstants.DASHBOARD_NAVIGATOR_SORT_CHANGED,
      orderBy:    orderBy,
      order:      order
    });
  },

  filter: (searchFor, searchInProperties) => {
    AppDispatcher.dispatch({
      actionType:         NavigatorConstants.DASHBOARD_NAVIGATOR_FILTER_CHANGED,
      searchFor:          searchFor,
      searchInProperties: searchInProperties
    });
  }

}
