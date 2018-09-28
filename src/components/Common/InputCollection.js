import React from 'react';
import Immutable from 'immutable';

class InputCollection extends React.Component{

  constructor(props){
    super(props);
  }

  getInitialState(){
    return Immutable.Map({
      data: {}
    });
  }

  itemAdd(){
    //Do stuff
    //Don't forget callback when done
    this.props.onItemAdd();
  }

  itemRemove(){
    //Do stuff
    //Don't forget callback when done
    this.props.onItemRemove();
  }

  handleChange(event){
    this.props.onChange(this.state);
  }

  render(){
    return(
      <div className="input-collection">

      </div>
    );
  }

}

InputCollection.defaultProps = {
  numRows: 1,
  maxRows: 10,
  onChange:     function(){},
  onItemAdd:    function(){},
  onItemRemove: function(){}
};

export default InputCollection;
