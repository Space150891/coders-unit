import PropTypes from 'prop-types';
import React from 'react';

class QuickFilterInput extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="quick-filter">
        <input
          type="text"
          className={this.props.classNames.join(' ')}
          placeholder={this.props.placeholder}
          onChange={function(e){
            let searchFor = e.target.value;
            this.props.onChange(searchFor, this.props.searchInProperties);
          }.bind(this)}
        />
      </div>
    );
  }

}

QuickFilterInput.propTypes = {
  searchInProperties: PropTypes.array,
  onChange:           PropTypes.func, //cb(searchFor, searchInProperties)
  placeholder:        PropTypes.string,
  classNames:         PropTypes.array
};

export default QuickFilterInput;