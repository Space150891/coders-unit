import _                           from 'lodash';
import config                      from 'config';
import AppDispatcher               from 'dispatcher';
import ThingConstants              from 'constants/actions/Things/Thing';
import NavigatorActions            from 'actions/Dashboard/NavigatorActions';
import ThingDataManager            from 'data_managers/ThingDataManager';
import ProductDataManager          from 'data_managers/ProductDataManager';
import GroupDataManager            from 'data_managers/GroupDataManager';

class ThingActions {

  load(id) {

    AppDispatcher.dispatch({
      actionType: ThingConstants.THINGS_THING_LOAD_START
    });

    return ThingDataManager.load(id)
      .then((response) => {
        let data = response.data;
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_LOADED,
          data:       data
        });
      })
      .then(ProductDataManager.loadAll.bind(ProductDataManager))
      .then((response) => {
        let data = response.data;
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_FORM_PRODUCTS_LOADED,
          data: data
        });
      })
      .then(GroupDataManager.loadTree.bind(ProductDataManager))
      .then((response) => {
        let data = response.data;
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_FORM_GROUPS_TREE_LOADED,
          data: data
        });
      })
      .finally(() => {
        AppDispatcher.dispatch({actionType: ThingConstants.THINGS_THING_LOAD_END});
      })
      .catch((err) => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_ERROR,
          error:      config.isDev() ? err.message : 'We have encountered an error while trying to load thing data'
        });
      });
  }

  delete(id){

    AppDispatcher.dispatch({
      actionType: ThingConstants.THINGS_THING_LOAD_START
    });

    return ThingDataManager.delete(id)
      .then(() => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_DELETED
        });
      })
      .then(NavigatorActions.loadThingsList)
      .finally(() => {
        AppDispatcher.dispatch({actionType: ThingConstants.THINGS_THING_LOAD_END});
      })
      .catch((err) => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_ERROR,
          error:      config.isDev() ? err.message : 'We have encountered an error while trying to delete this product'
        });
      });

  }

  //These are usually invoked from the thing form

  formCreate(){

    AppDispatcher.dispatch({
      actionType: ThingConstants.THINGS_THING_FORM_CREATE
    });

    AppDispatcher.dispatch({
      actionType: ThingConstants.THINGS_THING_LOAD_START
    });

    ProductDataManager.loadAll()
      .then((response) => {
        let data = response.data;
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_FORM_PRODUCTS_LOADED,
          data: data
        });
      })
      .then(GroupDataManager.loadTree.bind(ProductDataManager))
      .then((response) => {
        let data = response.data;
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_FORM_GROUPS_TREE_LOADED,
          data: data
        });
      })
      .then(() => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_FORM_EDIT_START
        });
      })
      .finally(() => {
        AppDispatcher.dispatch({actionType: ThingConstants.THINGS_THING_LOAD_END});
      });
  }

  formEditStart(id){
    //id == null means that we're working with a new thing
    //Otherwise it's an editing
    if(null !== id){
      this.load(id).then(() => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_FORM_EDIT_START
        });
      });
    } else {
      AppDispatcher.dispatch({
        actionType: ThingConstants.THINGS_THING_FORM_EDIT_START
      });
    }
  }

  formValueReset(names){
    AppDispatcher.dispatch({
      actionType: ThingConstants.THINGS_THING_FORM_RESET,
    });
  }

  formValueChange(name, oldValue, newValue){
    AppDispatcher.dispatch({
      actionType: ThingConstants.THINGS_THING_FORM_CHANGED,
      data: {
        name: name,
        oldValue: oldValue,
        newValue: newValue
      }
    });
  }

  formSave(draft){
    let promise = {};

    if(null === draft.get('id')){
      promise =
        ThingDataManager
          .create(draft)
          .then((response) => {
            //Response should contain the "Location" header which contains the URL
            //We then load that URL which will be our newly created product
            let locationUrl = _.get(response, 'headers.location', false);
            if(false === locationUrl) throw new Error('Server response does not contain Location header');
            return locationUrl;
          })
          .then(function(productUrl){
            return this.loadFromUrl(productUrl);
          }.bind(ThingDataManager));
    } else {
      promise =
        ThingDataManager
          .update(draft.get('id'), draft)
          .then(function(){
            return this.load(draft.get('id'));
          }.bind(ThingDataManager));
    }

    AppDispatcher.dispatch({
      actionType: ThingConstants.THINGS_THING_FORM_SAVE_START
    });

    return promise
      .then((response) => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_FORM_SAVE_SUCCESS
        });

        //Make sure we supply a newly returned thing to the UI
        let data = response.data;

        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_LOADED,
          data:       data
        });

        //The product we've just loaded will live in product property of the productStore state
        //The next action will copy it to draft thus making available for edit
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_FORM_EDIT_START
        });

      })
      .then(NavigatorActions.loadThingsList)
      .finally(() => {
        AppDispatcher.dispatch({
          actionType: ThingConstants.THINGS_THING_FORM_SAVE_END
        });
      })
      .catch((err) => {
        console.error(err);
        let code = _.get(err, ['response', 'status'], null);
        let data = _.get(err, ['response', 'data'], []);

        switch (code) {
          case 400:
            AppDispatcher.dispatch({
              actionType: ThingConstants.THINGS_THING_INVALID,
              data: data
            });
            break;
          default:
            console.error(err);
            AppDispatcher.dispatch({
              actionType: ThingConstants.THINGS_THING_ERROR,
              error: err.message
            });
            break;
        }
      })
  }

  formDiscard(){
    AppDispatcher.dispatch({
      actionType: ThingConstants.THINGS_THING_FORM_DISCARD
    });
  }

}

export default new ThingActions();
