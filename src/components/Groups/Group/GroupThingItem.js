import React from 'react';
import { Link } from 'react-router'

class GroupThingItem extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className={'thing thing-item item ' + (this.props.isActive ? 'active' : null)} onClick={this.props.onClick}>
        <div className="sn">
          {this.props.thing.get('sn') || 'Not provisioned'}
        </div>
        <div className="name">
          {this.props.thing.get('name')}
        </div>
        <div className="actions">
          <Link to={`/thing/${this.props.thing.get('id')}/readings`} className="icon" activeClassName="active">
            <i className="fa fa-tachometer" aria-hidden="true"></i>
          </Link>
          <Link to={`/thing/${this.props.thing.get('id')}/history`} className="icon second" activeClassName="active">
            <i className="fa fa-bar-chart" aria-hidden="true"></i>
          </Link>
          <Link to={`/things/${this.props.thing.get('id')}/edit`} className="icon third" activeClassName="active">
            <i className="fa fa-cog" aria-hidden="true"></i>
          </Link>
        </div>
      </div>
    );
  }

}

export default GroupThingItem;
