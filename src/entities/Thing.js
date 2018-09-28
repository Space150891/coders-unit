'use strict';

import Immutable from 'immutable';

const Thing = Immutable.Record({
  id:   null,
  sn:   '',
  name: '',
  product: null,
  group: null,
  locX: 0,
  locY: 0,
  lat: 0,
  lng: 0
});

export default Thing;
