import Immutable from 'immutable';

const updateTimespans = [
  { value: 1, label: '1 minute'},
  { value: 2, label: '2 minutes'},
  { value: 5, label: '5 minutes'},
  { value: 10, label: '10 minutes'},
  { value: 30, label: '30 minutes'},
  { value: 60, label: '1 hour'},
  { value: 120, label: '2 hours'},
  { value: 360, label: '5 hours'},
  { value: 720, label: '12 hours'},
  { value: 1440, label: '1 day'},
  { value: 2880, label: '2 days'},
  { value: 10080, label: '1 week'},
  { value: 20160, label: '2 weeks'}
];

export default Immutable.List(updateTimespans);
