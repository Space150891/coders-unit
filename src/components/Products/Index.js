import React, { Component } from 'react';
import SpinnerCog           from 'components/SpinnerCog';
import { Link }             from 'react-router';
import ProductDataManager   from 'data_managers/ProductDataManager';

class ProductsIndex extends Component {

  constructor(props) {
    super(props);
    this.state={
      isLoadingProducts: false,
      productsCount: 0
    };
  }

  componentDidMount(){
    this._loadProductsCount();
  }

  _loadProductsCount(){
    this.setState({isLoadingProducts: true});
    return ProductDataManager.loadAll().then((response) => {
      this.setState({productsCount: response.data.length});
    }).finally(() => {
      this.setState({isLoadingProducts: false});
    });
  }

  render() {
    return (
      <div>
        <h1>Products</h1>
        <p>Products define the way iMatrix interacts with your hardware.</p>
        <p>All your Sensors and Controls definitions are associated with a certain product.</p>
        <hr/>
        <span className="label label-default">
          {this.state.isLoadingProducts
            ?
            <SpinnerCog></SpinnerCog>
            :
            this.state.productsCount
          }
        </span> products available
        <div className="actions">
          <Link to={'/products/new'} className="btn btn-xs btn-success btn-raised">
            + Add New
          </Link>
        </div>
      </div>
    );
  }
}

export default ProductsIndex;
