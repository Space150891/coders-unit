'use strict';

import Immutable from 'immutable';

const File = Immutable.Record({
  id:           null,
  name:         '',
  mime:         '',
  path:         '',
  fsize:        null,
  timestamp:    null,
  organization: null
});

export default File;
