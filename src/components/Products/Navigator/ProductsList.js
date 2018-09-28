import React from 'react';
import ScrollArea         from 'react-scrollbar';
import ProductsListItem   from 'components/Products/Navigator/ProductsListItem';
import ImmutablePropTypes from 'react-immutable-proptypes';

class ProductsList extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="productsScroll">
        <ScrollArea
          speed={0.7}
          smoothScrolling={true}
          horizontal={false}
        >
          <div className="content">
            <div id="products-list" className="list">
              {this.props.products.toArray().map((product, key) => {
                return <ProductsListItem key={key} product={product}></ProductsListItem>
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

}

ProductsList.propTypes = {
  products: ImmutablePropTypes.map
};

export default ProductsList
