import Immutable from 'immutable';

const dataTypes = {
  'int32'  : 'int32',
  'uint32' : 'uint32',
  'float'  : 'float',
  'varlen' : 'varlen'
};

export default Immutable.Map(dataTypes);
