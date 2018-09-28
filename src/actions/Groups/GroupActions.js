import Q                from 'q';
import config           from 'config';
import AppDispatcher    from 'dispatcher';
import GroupConstants   from 'constants/actions/Groups/Group';
import GroupDataManager from 'data_managers/GroupDataManager';
import NavigatorActions from 'actions/Dashboard/NavigatorActions';

class GroupActions {

  changeLiveUpdates(val, interval) {
    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_LIVE_UPDATES_CHANGE,
      data: {
        doLiveUpdate: val,
        liveUpdatesInterval: interval
      }
    });
  }

  loadTree() {
    return GroupDataManager.loadTree()
      .then((response) => {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_TREE_LOADED,
          data: response.data
        });
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      })
  }

  loadGroup(groupId) {
    return GroupDataManager.load(groupId)
      .then((response) => {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_LOADED,
          data: response.data
        });
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      });
  }

  loadThings(groupId) {
    return GroupDataManager.loadThings(groupId)
      .then((response) => {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_THINGS_LOADED,
          data: response.data
        });
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      });
  }

  loadProducts(groupId) {
    return GroupDataManager.loadProducts(groupId)
      .then((response) => {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_PRODUCTS_LOADED,
          data: response.data
        });
      }).catch(err => {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_ERROR,
          error: config.isDev() ? err.message : 'We have encountered an error'
        });
      });
  }

  changeSelectedTimestampFrom(TimestampFrom) {
    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_HISTORY_SELECTED_TIMESTAMP_FROM_CHANGED,
      data: TimestampFrom
    });
  }

  changeSelectedTimestampTo(TimestampTo) {
    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_HISTORY_SELECTED_TIMESTAMP_TO_CHANGED,
      data: TimestampTo
    });
  }

  loadHistories(groupId, productId, propertyIds, timestampFrom, timestampTo) {

    const promises = propertyIds.map((propertyId) => {
      return GroupDataManager.loadPropertyHistory(groupId, productId, propertyId, timestampFrom, timestampTo)
    });

    return Promise.all(promises).then((results) => {

      const data = results.map((e) => e.data);
      AppDispatcher.dispatch({
        actionType: GroupConstants.GROUPS_GROUP_HISTORY_LOADED,
        data: {
          groupId: groupId,
          timestampFrom: timestampFrom,
          timestampTo: timestampTo,
          historyData: data,
          propertyIds: propertyIds
        }
      });

      return promises;
    }).catch(err => {
      AppDispatcher.dispatch({
        actionType: GroupConstants.GROUPS_GROUP_ERROR,
        error: config.isDev() ? err.message : 'We have encountered an error'
      });
    });
  }

  selectHistoryProduct(productId) {
    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_HISTORY_PRODUCT_SELECTED,
      data: {productId}
    });
  }

  selectHistoryProperty(propertyIds) {
    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_HISTORY_PROPERTY_SELECTED,
      data: {propertyIds}
    });
  }

  load(groupId) {
    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_LOAD_START
    });

    return this.loadTree()
    //@TODO instead of individual group loading - just select it on a tree
      .then(() => {
        return this.loadGroup(groupId)
      })
      .then(() => {
        return this.loadThings(groupId)
      })
      .finally(() => {
        setTimeout(() => {
          AppDispatcher.dispatch({actionType: GroupConstants.GROUPS_GROUP_LOAD_END});
        })
      });
  }

  selectThing(thingId) {
    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_THING_SELECTED,
      data: thingId
    });
  }

  formCreate(type, parentId){

    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_FORM_CREATE,
      data: {
        type:     type,
        parentId: parentId
      }
    });

    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_FORM_EDIT_START
    });

    //Need to end load here because the initial state does include isLoading set to true
    AppDispatcher.dispatch({actionType: GroupConstants.GROUPS_GROUP_LOAD_END});

    this.formEditStart(null);
  }

  formEditStart(id){

    //id == null means that we're working with a new group
    //Otherwise it's an editing
    if(null !== id){
      this.load(id).then(() => {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_FORM_EDIT_START
        });
      });
    } else {
      AppDispatcher.dispatch({
        actionType: GroupConstants.GROUPS_GROUP_FORM_EDIT_START
      });
    }
  }

  formValueChange(name, oldValue, newValue){
    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_FORM_CHANGED,
      data: {
        name: name,
        oldValue: oldValue,
        newValue: newValue
      }
    });
  }

  formSave(draft, component, type){
    let promise = {};

    const submissionJS = draft.submission.toJS();

    if(null === draft.get('id')){
      submissionJS.parent = +submissionJS.parent
      promise =
        GroupDataManager
          .create(submissionJS)
          .then((response) => {
            //Response should contain the "Location" header which contains the URL
            //We then load that URL which will be our newly created group
            let locationUrl = _.get(response, 'headers.location', false);
            if(false === locationUrl) throw new Error('Server response does not contain Location header');
            return locationUrl;
          })
          .then(function(groupUrl){
            return this.loadFromUrl(groupUrl);
          }.bind(GroupDataManager));
    } else {
      promise =
        GroupDataManager
          .update(draft.get('id'), submissionJS)
          .then(function(){
            return this.load(draft.get('id'));
          }.bind(GroupDataManager));
    }

    AppDispatcher.dispatch({
      actionType: GroupConstants.GROUPS_GROUP_FORM_SAVE_START
    });

    promise
      .then((response) => {

        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_FORM_SAVE_SUCCESS
        });

        //Make sure we supply a newly returned group to the UI
        //This way new properties will get proper IDs displayed
        let data = response.data;

        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_LOADED,
          data:       data
        });

        //The group we've just loaded will live in group property of the groupStore state
        //The next action will copy it to draft thus making available for edit
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_FORM_EDIT_START
        });

      })
      .finally(() => {
        if(draft.get('id')){
          this.load(draft.get('id'))
            .then(() => {
              return Promise.all([
                this.loadProducts(draft.get('id'))
              ])
            })
            .then(NavigatorActions.loadGroupsList())
        }else {
          AppDispatcher.dispatch({
            actionType: GroupConstants.GROUPS_GROUP_FORM_SAVE_END
          })
          NavigatorActions.loadGroupsList()
        }
      })
      .catch((err) => {
        console.error(err);
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_ERROR,
          error: err.message
        });
      })
  }

  formDiscard(draft){
    if (typeof draft.get === 'function') {
      if (draft.get('id')) {
        this.load(draft.get('id'))
          .then(() => {
            AppDispatcher.dispatch({
              actionType: GroupConstants.GROUPS_GROUP_FORM_DISCARD
            })
          })
      } else {
        AppDispatcher.dispatch({
          actionType: GroupConstants.GROUPS_GROUP_LOAD_START
        })
        this.loadTree()
        //@TODO instead of individual group loading - just select it on a tree
          .then(
            AppDispatcher.dispatch({
              actionType: GroupConstants.GROUPS_GROUP_FORM_DISCARD
            })
          )
          .finally(() => {
            setTimeout(() => {
              AppDispatcher.dispatch({actionType: GroupConstants.GROUPS_GROUP_LOAD_END});
            })
          })
      }
    } else {
      AppDispatcher.dispatch({
        actionType: GroupConstants.GROUPS_GROUP_FORM_DISCARD
      })
    }
  }

  formDelete(draft){
    var parentId = 0
    GroupDataManager.load(draft.get('id'))
      .then((response) => {
        parentId = response.data.parent
      })
      .finally(()=>{
        GroupDataManager
          .delete(draft.get('id'))
          .then(()=>{
            if (parentId) {
              this.load(parentId)
            }
          })
      })
  }

}

export default new GroupActions();
