'use strict';

import Immutable from 'immutable';

const GmapMarker = Immutable.Record({
  title: '',
  description: '',
  position: {
    lat: 0,
    lng: 0
  }
});

export default GmapMarker;
