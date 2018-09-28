import _                   from 'lodash';
import config              from 'config';
import AppDispatcher       from 'dispatcher';
import ProductConstants    from 'constants/actions/Products/Product';
import NavigatorActions    from 'actions/Products/NavigatorActions';
import ProductDataManager  from 'data_managers/ProductDataManager';
import PlatformDataManager from 'data_managers/PlatformDataManager';

class ProductActions {

  load(id) {

    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_LOAD_START
    });

    return PlatformDataManager.loadPlatforms()
      .then((response) => {
        let data = response.data;
        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_PLATFORMS_LOADED,
          data: data
        });
      })
      .then(() => {return ProductDataManager.load(id)})
      .then((response) => {
        let data = response.data;
        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_LOADED,
          data:       data
        });
      })
      .finally(() => {
        AppDispatcher.dispatch({actionType: ProductConstants.PRODUCTS_PRODUCT_LOAD_END});
      })
      .catch((err) => {

        let code = _.get(err, ['response', 'status'], null);
        let data = _.get(err, ['response', 'data'], []);

        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_ERROR,
          error:      config.isDev() ? err.message : 'We have encountered an error while trying to load product data'
        });
      });
  }

  delete(id){

    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_LOAD_START
    });

    return ProductDataManager.delete(id)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_DELETED
        });
      })
      .then(NavigatorActions.loadProductsList)
      .finally(() => {
        AppDispatcher.dispatch({actionType: ProductConstants.PRODUCTS_PRODUCT_LOAD_END});
      })
      .catch((err) => {
        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_ERROR,
          error:      config.isDev() ? err.message : 'We have encountered an error while trying to delete this product'
        });
      });

  }

  downloadSources(id){
    try{
      let sourcesUrl = ProductDataManager.getSourcesDownloadUrl(id);
      window.location = sourcesUrl;
    }catch(e){
      AppDispatcher.dispatch({
        actionType: ProductConstants.PRODUCTS_PRODUCT_ERROR,
        error:      config.isDev() ? e.message : 'We have encountered an error while trying to download your source files'
      });
    }
  }

  //These are usually invoked from the product form

  formCreate(){

    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_CREATE
    });

    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_LOAD_START
    });

    PlatformDataManager.loadPlatforms()
      .then((response) => {
        let data = response.data;
        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_PLATFORMS_LOADED,
          data: data
        });
      })
      .then(() => {
        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_EDIT_START
        });
      })
      .finally(() => {
        AppDispatcher.dispatch({actionType: ProductConstants.PRODUCTS_PRODUCT_LOAD_END});
      });
  }

  formEditStart(id){
    //id == null means that we're working with a new product
    //Otherwise it's an editing
    if(null !== id){
      this.load(id).then(() => {
        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_EDIT_START
        });
      });
    } else {
      AppDispatcher.dispatch({
        actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_EDIT_START
      });
    }
  }

  formValueChange(name, oldValue, newValue){
    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_CHANGED,
      data: {
        name: name,
        oldValue: oldValue,
        newValue: newValue
      }
    });
  }

  formChildrenIntegratedDisabledChange(childId, doDisable = true){
    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_CHILDREN_INTEGRATED_DISABLED_CHANGED,
      data: {
       childId:   childId,
       doDisable: doDisable
      }
    });
  }

  formSave(draft){

    let promise = {};

    draft.get('properties').keySeq().forEach(
      (key) => {
        draft = draft.setIn(['properties', key, 'product'], draft.get('id'));
      }
    );

    const submissionJS = draft.submission.toJS();

    if(null === draft.get('id')){
      promise =
        ProductDataManager
          .create(submissionJS)
          .then((response) => {
            //Response should contain the "Location" header which contains the URL
            //We then load that URL which will be our newly created product
            let locationUrl = _.get(response, 'headers.location', false);
            if(false === locationUrl) throw new Error('Server response does not contain Location header');
            return locationUrl;
          })
          .then(function(productUrl){
            return this.loadFromUrl(productUrl);
          }.bind(ProductDataManager));
    } else {
      promise =
        ProductDataManager
          .update(draft.get('id'), submissionJS)
          .then(function(){
            return this.load(draft.get('id'));
          }.bind(ProductDataManager));
    }

    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_SAVE_START
    });

    promise
      .then((response) => {

        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_SAVE_SUCCESS
        });

        //Make sure we supply a newly returned product to the UI
        //This way new properties will get proper IDs displayed
        let data = response.data;

        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_LOADED,
          data:       data
        });

        //The product we've just loaded will live in product property of the productStore state
        //The next action will copy it to draft thus making available for edit
        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_EDIT_START
        });

      })
      .then(NavigatorActions.loadProductsList)
      .finally(() => {
        AppDispatcher.dispatch({
          actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_SAVE_END
        });
      })
      .catch((err) => {

        let code = _.get(err, ['response', 'status'], null);
        let data = _.get(err, ['response', 'data'], []);

        switch (code) {
          case 400:
            AppDispatcher.dispatch({
              actionType: ProductConstants.PRODUCTS_PRODUCT_INVALID,
              data: data
            });
            break;
          default:
            AppDispatcher.dispatch({
              actionType: ProductConstants.PRODUCTS_PRODUCT_ERROR,
              error: err.message
            });
            break;
        }
      })

  }

  formDiscard(){
    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_DISCARD
    });
  }

  //Property Add/Edit/Remove

  formPropertyCreate(){
    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_PROPERTY_CREATE
    });
    this.formPropertyEditStart(null);
  }

  formPropertyRemove(key){
    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_PROPERTY_REMOVE,
      key: key
    });
  }

  formPropertyEditStart(key){
    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_PROPERTY_EDIT_START,
      key: key
    });
  }

  formPropertySave(key, property){
    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_PROPERTY_SAVE,
      key: key,
      property: property
    });
  }

  formChildrenEditDiscard(){
    AppDispatcher.dispatch({
      actionType: ProductConstants.PRODUCTS_PRODUCT_FORM_CHILDREN_EDIT_DISCARD
    });
  }

}

export default new ProductActions();
