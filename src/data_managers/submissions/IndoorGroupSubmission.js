'use strict';

import Immutable from 'immutable';

const IndoorGroupSubmission = Immutable.Record({
  id:          null,
  name:        '',
  type:        null,
  parent:      null,
  areaGeoJson: '',
});

export default IndoorGroupSubmission;
