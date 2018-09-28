'use strict';

import Immutable from 'immutable';

const IndoorBaseGroupSubmission = Immutable.Record({
  id:            null,
  name:          '',
  type:          null,
  parent:        null,
  dimX:          null,
  dimY:          null,
  unitsPerPixel: 1,
  tileUrl:       '',
  minZoom:       0,
  maxZoom:       3,
  planFile:      null
});

export default IndoorBaseGroupSubmission;
