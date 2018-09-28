import AppDispatcher     from 'dispatcher';
import {ReduceStore}     from 'flux/utils';

class PlatformStore extends ReduceStore {

  constructor() {
    super(AppDispatcher);
  }

  getInitialState(){
    let defaultState = {};
    return defaultState;
  }

  reduce(state, action){

    let newState = Object.assign({}, state);

    switch(action.actionType) {

      default:
        return state;

    }

  }
}

export default new PlatformStore();
