import React, { Component } from 'react';
import SpinnerCog           from 'components/SpinnerCog';
import { Link }             from 'react-router';
import ThingDataManager     from 'data_managers/ThingDataManager';
import ProductDataManager   from 'data_managers/ProductDataManager';

class DashboardIndex extends Component {

  constructor(props) {
    super(props);
    this.state={
      isLoadingProducts: false,
      isLoadingThings:   false,
      productsCount: 0,
      thingsCount: 0
    };
  }

  componentDidMount(){
    this._loadCounts();
  }

  _loadProductsCount(){
    this.setState({isLoadingProducts: true});
    return ProductDataManager.loadAll().then((response) => {
      this.setState({productsCount: response.data.length});
    }).finally(() => {
      this.setState({isLoadingProducts: false});
    });
  }

  _loadThingsCount(){
    this.setState({isLoadingThings: true});
    return ThingDataManager.loadAll().then((response) => {
      this.setState({thingsCount: response.data.length});
    }).finally(() => {
      this.setState({isLoadingThings: false});
    });
  }

  _loadCounts(){
   this._loadProductsCount().then(this._loadThingsCount.bind(this));
  }

  render() {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        Welcome to the iMatrix Web UI. Use the navigator on the left to view your things.
        <hr/>
        <h4>Products</h4>
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
          <Link to={'/products'} className="btn btn-xs btn-raised">
            View All
          </Link>
        </div>
        <hr/>
        <h4>Things</h4>
        <span className="label label-default">
          {this.state.isLoadingThings
            ?
            <SpinnerCog></SpinnerCog>
            :
            this.state.thingsCount
          }
        </span> things available
        <div className="actions">
          <Link to={'/things/new'} className="btn btn-xs btn-success btn-raised">
            + Add New
          </Link>
        </div>
        <hr/>
      </div>
    );
  }
}

export default DashboardIndex;
