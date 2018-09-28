import React from 'react';
import ThingsListItem from 'components/Dashboard/Navigator/ThingsListItem';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Product from 'entities/Product';

class ThingsList extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div id="things-list" className="list">
        {this.props.things.map((thing, key) => {
          const productId = thing.get('product');
          const product   = this.props.products.get(productId) || new Product();
          if(thing.get('sn')){
            return <ThingsListItem key={key} thing={thing} product={product}></ThingsListItem>
          }
        })}
      </div>
    );
  }

}

ThingsList.propTypes = {
  things: ImmutablePropTypes.list,
  products: ImmutablePropTypes.map
};

export default ThingsList;
