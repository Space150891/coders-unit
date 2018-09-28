'use strict';

import Immutable from 'immutable';

const OutdoorGroupSubmission = Immutable.Record({
  id: null,
  name: '',
  type: '',
  parent: '',
  areaGeoJson: ''
});

export default OutdoorGroupSubmission;
