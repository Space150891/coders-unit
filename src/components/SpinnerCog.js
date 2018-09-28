import React from 'react';

class SpinnerCog extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <span>
        <i className="fa fa-cog fa-spin" style={this.props}></i>
        {this.props.children}
      </span>
    );
  }
}

export default SpinnerCog;
