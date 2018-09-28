'use strict';

import Immutable from 'immutable';

const OutdoorGroupSubmission = Immutable.Record({
  id: null,
  name: '',
  type: '',
  parent: '',
  lat: 0,
  lng: 0
});

export default OutdoorGroupSubmission;
