import PropTypes from 'prop-types';
import React            from 'react';
import iMatrixPropTypes from 'utils/iMatrixPropTypes';

class CheckboxAndValueInput extends React.Component{

  constructor(){
    super();
    this.state = {
      isValueInputEnabled: false
    }
  }

  componentWillReceiveProps(nextProps){
    let newIsCheckboxEnabled = nextProps.value > 0 ? true : false;
    this.setState({isValueInputEnabled: newIsCheckboxEnabled});
  }

  handleCheckboxChange(event){
    let newValue = event.target.checked;
    this.setState({isValueInputEnabled: newValue});
    if(false === newValue){
      this.props.onValueChange({name: this.props.name, value: null});
    }
  }

  handleValueChange(event){
    let newValue = event.target.value;
    this.setState({isValueInputEnabled: newValue > 0 ? true : false});
    this.props.onValueChange({name: this.props.name, value: newValue});
  }

  render(){
    return (
      <div className="checkbox-and-value">
        <input
          type="checkbox"
          checked={this.state.isValueInputEnabled}
          onChange={this.handleCheckboxChange.bind(this)}/>
        <input
          className="form-control"
          type="text"
          value={this.props.value || ''}
          disabled={!this.state.isValueInputEnabled}
          onChange={this.handleValueChange.bind(this)}
          placeholder={this.state.isValueInputEnabled ? 'Enter value' : 'Not used'}
        />
      </div>
    )
  }
}

CheckboxAndValueInput.defaultProps = {
  name: null,
  value: null
};

CheckboxAndValueInput.propTypes = {
  name:          PropTypes.string,
  value:         PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.number]),
  onValueChange: PropTypes.func
};

export default CheckboxAndValueInput;