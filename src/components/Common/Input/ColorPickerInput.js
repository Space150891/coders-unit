'use strict'

import PropTypes from 'prop-types';

import React from 'react'
import reactCSS from 'reactcss'
import { CompactPicker } from 'react-color'

class ColorPickerInput extends React.Component {

  constructor(){
    super();
    this.state = {
      displayColorPicker: false,
      color: '#000'
    };
  }

  componentWillReceiveProps(nextProps){
    this.setState({color: nextProps.color});
  }

  handleClick(){
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  }

  handleClose() {
    this.setState({ displayColorPicker: false })
  }

  handleChange(color) {
    this.setState({ color: color.hex }, () => {
      this.props.onChange(this.state.color);
    });
  }

  render() {

    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '5px',
          borderRadius: '2px',
          background: `${ this.props.color }`
        },
        swatch: {
          padding: '5px',
          background: '#f7f7f7',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          cursor: 'pointer'
        },
        popover: {
          position: 'absolute',
          zIndex: '2'
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px'
        },
        hint: {
          fontSize: '10px',
          textAlign: 'center',
          paddingBottom: '5px'
        }
      }
    });

    return (
      <div className="color-picker">
        <div style={ styles.swatch } onClick={ this.handleClick.bind(this) }>
          <div className="hint" style={ styles.hint}>{this.props.hint}</div>
          <div style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose.bind(this)  }/>
          <CompactPicker color={ this.props.color } onChange={ this.handleChange.bind(this)  } />
        </div> : null }
      </div>
    )
  }
}

ColorPickerInput.defaultProps = {
  hint: 'Color',
  color: '#000'
};

ColorPickerInput.propTypes = {
  hint:     PropTypes.string,
  color:    PropTypes.string,
  onChange: PropTypes.func
};

export default ColorPickerInput;
