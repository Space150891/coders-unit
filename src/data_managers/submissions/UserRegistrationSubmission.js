'use strict';

import Immutable         from 'immutable';

const UserRegistrationSubmission = Immutable.Record({
  name:           '',
  phone:          '',
  organization:   null, //organization id
  email:          '',
  username:       '',
  plainPassword:  {first: '', second: ''}
});

export default UserRegistrationSubmission;
