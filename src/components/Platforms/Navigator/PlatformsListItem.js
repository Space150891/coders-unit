import React from 'react';
import { Link } from 'react-router'

class PlatformsListItem extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="thing-item item">
        <Link to={`/platforms/${this.props.data.id}`} className="primary" activeClassName="active">
          {this.props.data.name}
        </Link>
      </div>
    );
  }

}

export default PlatformsListItem;
