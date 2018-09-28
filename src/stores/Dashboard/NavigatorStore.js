import _                  from 'lodash';
import Immutable          from 'immutable'
import AppDispatcher      from 'dispatcher';
import {ReduceStore}      from 'flux/utils';
import NavigatorConstants from 'constants/actions/Dashboard/Navigator';
import AuthConstants      from 'constants/actions/Auth';
import Thing              from 'entities/Thing';
import Group              from 'entities/Group';
import Product            from 'entities/Product';

class NavigatorStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  getInitialState(){
    return  {
      isLoading:    true,
      mode:         NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS,
      //@TODO Maybe this should be taken from another store that has these instead... Need some big refactoring to make that happen
      products:       new Immutable.Map(),
      things:         new Immutable.List(),
      thingsFiltered: new Immutable.List(),
      groups:         new Immutable.List(),
      groupsFiltered: new Immutable.List(),
      sort:           {orderBy: 'sn', order: 1},
      error:          null
    }
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_CHANGE_START:
        newState.isLoading = true;
        newState.mode      = action.mode;
        return newState;
        break;

      case NavigatorConstants.DASHBOARD_NAVIGATOR_PRODUCTS_LOADED:

        newState.error = null;
        newState.products = Immutable.fromJS(action.data, function(k,v){
          if('' === k) return v.toMap();
          if(v.get('id') != undefined) return new Product(v);
          return v;
        });

        //Modify the map so that product IDs become map keys
        newState.products = newState.products.mapKeys((k,v) => {
          return v.get('id');
        });
        return newState;
        break;

      case NavigatorConstants.DASHBOARD_NAVIGATOR_LIST_LOADED:
        return ((newState) => {

          newState.error = null;

          const items = Immutable.fromJS(action.data, function(k,v){
            if('' === k) return v.toList();
            if(v.get('id') != undefined && NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS === newState.mode ) return new Thing(v);
            if(v.get('id') != undefined && NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_GROUPS === newState.mode ) return new Group(v);
            return v;
          });

          const orderBy = newState.sort.orderBy;
          const order   = newState.sort.order || 1; //1 or -1

          const sortedItems = items.sort((a,b) => {
            if(a.get(orderBy) && b.get(orderBy)){
              return new String(a.get(orderBy)).localeCompare(b.get(orderBy)) * order;
            } return 0;
          });

          switch(newState.mode){
            case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS:
              newState.things = sortedItems;
              newState.thingsFiltered = newState.things;
              break;
            case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_GROUPS:
              newState.groups = sortedItems;
              break;
          }

          return newState;
        })(newState);
        break;

      case NavigatorConstants.DASHBOARD_NAVIGATOR_SORT_CHANGED:
        return ((newState) => {

          const orderBy = action.orderBy;
          const order   = action.order || 1; //1 or -1

          //This works the same way for both things and groups
          const comparator = function(a,b){
            if(a.get(orderBy) && b.get(orderBy)){
              return new String(a.get(orderBy)).localeCompare(b.get(orderBy)) * order;
            } return 0;
          }

          switch(newState.mode){
            case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS:
              newState.thingsFiltered = newState.thingsFiltered.sort(comparator);
              break;
            case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_GROUPS:
              newState.groupsFiltered = newState.groupsFiltered.sort(comparator);
              break;
          }

          newState.sort = {orderBy: orderBy, order: order};

          return newState;
        })(newState);
        break;

      case NavigatorConstants.DASHBOARD_NAVIGATOR_FILTER_CHANGED:
        return ((newState) => {

          const searchFor          = action.searchFor;
          const searchInProperties = action.searchInProperties || [];

          //This works the same way for both things and groups
          const filtrator = function(item){
            for(var key in searchInProperties){
              let propertyName = searchInProperties[key];
              if(item[propertyName]){
                if(_.includes(item[propertyName], searchFor)) return true;
              }
            }
            return false;
          }

          //We've got something to filter by only if search is not empty and criteria is not an empty array
          if(searchFor && searchInProperties.length > 0){
            switch(newState.mode){
              case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS:
                newState.thingsFiltered = newState.things.filter(filtrator);
                break;
              case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_GROUPS:
                newState.groupsFiltered = newState.groups.filter(filtrator);
                break;
            }
          } else {
            //Nothing to filter by - just copy the data
            switch(newState.mode){
              case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS:
                newState.thingsFiltered = newState.things;
                break;
              case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_GROUPS:
                newState.groupsFiltered = newState.groups;
                break;
            }

          }

          return newState;
        })(newState);
        break;

      case NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_CHANGE_END:
        newState.isLoading = false;
        return newState;
        break;

      case NavigatorConstants.DASHBOARD_NAVIGATOR_ERROR:
        newState.error = action.error;
        return newState;
        break;

      case AuthConstants.AUTH_LOGOUT:
        return this.getInitialState();
        break;

      default:
        return state;
    }

  }

}

export default new NavigatorStore();
