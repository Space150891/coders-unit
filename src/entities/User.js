'use strict';

import Immutable from 'immutable';
import WifiSecurityModes from 'constants/WifiSecurityModes';

const User = Immutable.Record({
  name:               '',
  phone:              '',
  currentPassword:    '', //required to submit profile changes
  organization:       {},
  email:              '',
  username:           '',
  stSsid:             '',
  stKey:              '',
  stSecurityMode:     WifiSecurityModes.keySeq().first()
});

export default User;
