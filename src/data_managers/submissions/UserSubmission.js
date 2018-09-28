'use strict';

import Immutable         from 'immutable';
import WifiSecurityModes from 'constants/WifiSecurityModes';

const UserSubmission = Immutable.Record({
  name:           '',
  phone:          '',
  currentPassword: '',
  stSsid:         '',
  stKey:          '',
  stSecurityMode: WifiSecurityModes.keySeq().first()
});

export default UserSubmission;
