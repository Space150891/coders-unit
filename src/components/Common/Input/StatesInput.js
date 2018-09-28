import PropTypes from 'prop-types';
import React              from 'react';
import Immutable          from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import stateRow           from 'entities/State'
import ColorPickerInput   from 'components/Common/Input/ColorPickerInput.js';

class StatesInput extends React.Component{

  constructor(){
    super();
  }

  addRow(){
    this.props.onChange(this.props.rows.push(new stateRow()));
  }

  deleteRow(key){
    this.props.onChange(this.props.rows.delete(key));
  }

  handleRowPropertyChange(rowKey, propertyName, newValue){
    this.props.onChange(this.props.rows.setIn([rowKey, propertyName], newValue));
  }

  render(){
    return (
      <div className="states">
        {this.props.rows.map((stateRow, rowKey) => {
          return(
            <div className="row form-group" key={rowKey}>
              <input
                className="value"
                type="text"
                value={stateRow.get('value')}
                onChange={(event) => {this.handleRowPropertyChange(rowKey, 'value', event.target.value)}}
                placeholder="Value"
              />
              <input
                className="text"
                type="text"
                value={stateRow.get('text')}
                onChange={(event) => {this.handleRowPropertyChange(rowKey, 'text', event.target.value)}}
                placeholder="Text"
              />
              <div className="text-color">
                <ColorPickerInput
                  hint="text"
                  color={stateRow.get('textColor')}
                  onChange={(color) => {this.handleRowPropertyChange(rowKey, 'textColor', color)}}/>
              </div>
              <div className="bg-color">
                <ColorPickerInput
                  hint="bg"
                  color={stateRow.get('bgColor')}
                  onChange={(color) => {this.handleRowPropertyChange(rowKey, 'bgColor', color)}}/>
              </div>
              <a className="btn btn-danger btn-xs" onClick={() => {this.deleteRow(rowKey)}}>Delete</a>
            </div>
          );
        })}
        <a className="btn btn-primary btn-raised btn-xs" onClick={this.addRow.bind(this)}>
          <i className="fa fa-plus fa-fw" aria-hidden="true"></i>
          Add
        </a>
      </div>
    )
  }
}

StatesInput.defaultProps = {
  rows: new Immutable.List()
};

StatesInput.propTypes = {
  rows: ImmutablePropTypes.list,
  onChange: PropTypes.func
};

export default StatesInput;