import config              from 'config';
import AppDispatcher       from 'dispatcher';
import NavigatorConstants  from 'constants/actions/Products/Navigator';
import ProductDataManager  from 'data_managers/ProductDataManager';

export default {

  loadProductsList: () => {

    AppDispatcher.dispatch({
      actionType: NavigatorConstants.PRODUCTS_NAVIGATOR_LOAD_START
    });

    ProductDataManager.loadAll().then((response) => {

      let data = response.data;

      AppDispatcher.dispatch({
        actionType: NavigatorConstants.PRODUCTS_NAVIGATOR_LIST_LOADED,
        data:       data
      });

    }).finally(() => {

      AppDispatcher.dispatch({actionType: NavigatorConstants.PRODUCTS_NAVIGATOR_LOAD_END});

    }).catch((err) => {

      AppDispatcher.dispatch({
        actionType: NavigatorConstants.PRODUCTS_NAVIGATOR_LOAD_ERROR,
        error:      config.isDev() ? err.message : 'We have encountered an error'
      });

    });
  }
}
