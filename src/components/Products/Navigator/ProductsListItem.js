import React              from 'react';
import { Link }           from 'react-router';
import ImmutablePropTypes from 'react-immutable-proptypes';
import config             from 'config';

class ProductsListItem extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="thing-item item">
        <Link to={`/products/${this.props.product.get('id')}`} className="primary" activeClassName="active">
          <img className="product-icon" src={this.props.product.get('iconFileUri') || config.defaultProductIconUri} alt=""/>
          {this.props.product.get('name')}
        </Link>
        <Link to={`/products/${this.props.product.get('id')}/edit`} className="icon" activeClassName="active">
          <i className="fa fa-cog" aria-hidden="true"></i>
        </Link>
      </div>
    );
  }

//<Link to={`/products/${this.props.product.get('id}/code/download`} className="icon" activeClassName="active">
//<i className="fa fa-cloud-download" aria-hidden="true"></i>
//</Link>
}

ProductsListItem.propTypes = {
  product: ImmutablePropTypes.record
};

export default ProductsListItem;
