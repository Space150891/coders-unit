'use strict';

import Immutable from 'immutable';

const State = Immutable.Record({
    'value': null,
    'text': '',
    'textColor': '#000',
    'bgColor': '#fff'
});

export default State;
