import Immutable from 'immutable';

const groupTypes = {
  GROUP_TYPE_ROOT             : 0,
  GROUP_TYPE_OUTDOOR_SITE     : 1,
  GROUP_TYPE_OUTDOOR_BUILDING : 2,
  GROUP_TYPE_INDOOR_BASE      : 3,
  GROUP_TYPE_INDOOR           : 4
};

export default Immutable.Map(groupTypes);
