import Immutable from 'immutable';

const groupTypes = {
  GROUP_LVL_ROOT        : 0,
  GROUP_LVL_SITE        : 1,
  GROUP_LVL_BUILDING    : 2,
  GROUP_LVL_FLOOR       : 3,
  GROUP_LVL_ROOM        : 4
};

export default Immutable.Map(groupTypes);
