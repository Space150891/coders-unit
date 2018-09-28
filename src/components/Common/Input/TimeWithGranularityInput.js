import PropTypes from 'prop-types';
import React            from 'react';

//Order matters for guessGranularityByValue(), has to be ascending
const granularities = {
  'ms': 1,
  's': 1000,
  'm': 60000,
  'h': 3600000
};

class TimeWithGranularityInput extends React.Component{

  constructor(){
    super();
    this.state = {
      activeGranularity: 'ms',
      displayedValue: 0
    };
  }

  componentWillMount(){
    let granularityGuess = this.guessGranularityByValue(this.props.value);
    this.setState({activeGranularity: granularityGuess});
  }

  guessGranularityByValue(value){
    const keys = Object.keys(granularities);
    let result = keys[0];
    keys.map((v) => {
      if(0 === value % granularities[v]) result = v;
    });
    return result;
  }

  componentWillReceiveProps(nextProps){
    let multiplier = granularities[this.state.activeGranularity] || 1;
    this.setState({displayedValue: nextProps.value / multiplier});
  }

  handleGranularityChange(event){
    let newGranularity = event.target.value;
    let multiplier = granularities[newGranularity] || 1;
    this.setState({activeGranularity: newGranularity, displayedValue: this.props.value / multiplier});
  }

  handleValueChange(event){
    let newValue = event.target.value;
    let multiplier = granularities[this.state.activeGranularity] || 1;
    this.props.onValueChange({name: this.props.name, value: newValue * multiplier});
  }

  render(){
    return (
      <div className="time-and-granularity">
        <input
          type="text"
          value={this.state.displayedValue}
          onChange={this.handleValueChange.bind(this)}
        />
        <select
          onChange={this.handleGranularityChange.bind(this)}
          value={this.state.activeGranularity}
        >
          {Object.keys(granularities).map((k) => {
            return <option value={k} key={k}>{k}</option>;
          })}
        </select>
      </div>
    )
  }

}

TimeWithGranularityInput.defaultProps = {
  name: null,
  value: 0
};

TimeWithGranularityInput.propTypes = {
  name:          PropTypes.string,
  value:         PropTypes.number,
  onValueChange: PropTypes.func
};

export default TimeWithGranularityInput;