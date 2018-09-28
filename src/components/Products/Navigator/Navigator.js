import React              from 'react';
import {Container}        from 'flux/utils';
import NavigatorStore     from 'stores/Products/NavigatorStore';
import { Alert }          from 'react-bootstrap';
import ProductsList       from 'components/Products/Navigator/ProductsList';
import SpinnerCog         from 'components/SpinnerCog';
import { Link }           from 'react-router'
import NavigatorActions   from 'actions/Products/NavigatorActions';

class Navigator extends React.Component{

  constructor(props){
    super(props);
  }

  static getStores(){
    return [NavigatorStore];
  }

  static calculateState(){
    return NavigatorStore.getState();
  }

  componentDidMount(){
    NavigatorActions.loadProductsList();
  }

  getContent(){

    if(this.state.error){
      return <Alert bsStyle="danger">{this.state.error}</Alert>;
    }

    if(true === this.state.isLoading){
      return <SpinnerCog> Loading...</SpinnerCog>;
    }

    if(this.state.products.size > 0){
      return <ProductsList products={this.state.products}></ProductsList>
    }

    return <div>Nothing to show</div>
  }

  render(){
    return(
      <div id="navigator" className="well">
        <div className="header">
          <div className="actions">
            <Link to="/products/new" className="btn btn-sm btn-success btn-raised">
              + New
            </Link>
          </div>
        </div>
        <div className="content">
          {this.getContent()}
        </div>
      </div>
    );
  }

}

export default Container.create(Navigator);
