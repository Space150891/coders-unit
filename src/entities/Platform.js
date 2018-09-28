'use strict';

import Immutable from 'immutable';
import PropertyTypes from 'constants/PropertyTypes';

const Platform = Immutable.Record({
  id: null,
  name: '',
  imageFileName: '',
  description: '',
  properties:  new Immutable.Map(),
  get sensors(){
    return this.properties.filter((property) => {
      return property.type === PropertyTypes.PROPERTY_TYPE_SENSOR;
    })
  },
  get controls(){
    return this.properties.filter((property) => {
      return property.type === PropertyTypes.PROPERTY_TYPE_CONTROL;
    })
  }
});

export default Platform;
