'use strict';

import Immutable from 'immutable';

const PropertySubmission = Immutable.Record({
  id:                  null,
  type:                0,
  name:                '',
  units:               '',
  ioType:              0,
  defineAs:            '',
  dataType:            '',
  defaultValue:        null,
  product:             null,
  warningThresholds:   new Immutable.List(),
  states:              null,
  mode:                0,
  min:                 0,
  max:                 0,
  isArduinoModule:     false,
  sampleRate:          60000,
  pollRate:            1000,
  sampleBatchSize:     15,
  isEnabled:           true,
  sendToCloud:         true,
  sendOnPercentChange: null,
  useWarningLevelLow:  true,
  useWarningLevelHigh: true
});

export default PropertySubmission;
