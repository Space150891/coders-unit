import React              from 'react';
import { Link }           from 'react-router';
import ImmutablePropTypes from 'react-immutable-proptypes';
import config             from 'config';

class ThingsListItem extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="thing-item item">
        <Link to={`/thing/${this.props.thing.get('id')}/map`} className="primary" activeClassName="active">
          <img className="product-icon" src={this.props.product.get('iconFileUri') || config.defaultProductIconUri} alt=""/>
          {this.props.thing.get('sn') || 'No S/N'} <span className="name">
            {this.props.thing.get('name')}
          </span>
        </Link>
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
    );
  }

}

ThingsListItem.propTypes = {
  thing:   ImmutablePropTypes.record,
  product: ImmutablePropTypes.record
};

export default ThingsListItem;
