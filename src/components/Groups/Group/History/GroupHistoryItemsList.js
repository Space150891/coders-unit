import PropTypes            from 'prop-types';
import React                from 'react';
import Immutable            from 'immutable';
import ImmutablePropTypes   from 'react-immutable-proptypes';
import Product              from 'entities/Product';
import { FormControl, DropdownButton, MenuItem }      from 'react-bootstrap';
//"Items" because it can be either property or product
class GroupHistoryItemsList extends React.Component{

  constructor(props){
    super(props);
  }

  render(){

    let activeProduct = this.props.products.get(this.props.activeProductId, new Product());
    // @TODO these should be Immutable.Map() - need to write a proper reviver function in the store
    let productProperties = activeProduct.get('properties', new Immutable.List());
    // @TODO convert platform to immutable Map or record too - that will allow using getIn()
    let platformProperties = activeProduct.get('platform', {properties:  new Immutable.List()}).properties;
    //We use .toList() here to avoid values loss due to keys overlapping
    //Without it - the platform properties with the given keys will drop the product properties with the same keys
    let properties = productProperties.toList().concat(platformProperties.toList());

    const { activeProductId, activePropertyIds } = this.props;
    const selectedProduct = this.props.products.find((e) => {
      return e.id === activeProductId;
    });

    // TODO: check how to show multiple selected values
    // const selectedProperties = activeProductId && properties.filter((e) => {
    //   return activePropertyIds.indexOf(e.id) > -1;
    // });
    return(
      <div className="history-properties">
        <h4>Products</h4>
        {!this.props.products.isEmpty()
          ?
          <div>
            <DropdownButton
              className={'custom-select'}
              bsStyle={'success'}
              title={selectedProduct ? selectedProduct.get('name') : 'Select a product'}
              onSelect={(e) => {
                this.props.onProductChange(e)
              }}
              id={'dropdown-custom-1'}
            >
              {this.props.products
                .entrySeq()
                .map(([key, property]) => {
                  return(
                    <MenuItem key={key} active={property.id === activeProductId} eventKey={property.id}>{property.name}</MenuItem>
                  );
              })}
            </DropdownButton>
            {properties.length == 0 ? <div>No history available</div> : null}
          {this.props.activeProductId > 0 &&
            <DropdownButton
                bsStyle={'default'}
                title={activePropertyIds.length > 0 ? 'selected' : 'Select a sensor'}
                onSelect={(e) => {
                  this.props.onPropertyChange(e, properties)
                }}
                id={'dropdown-custom-2'}
              >
                {properties
                .filter((property) => {return property.isNumeric})
                .entrySeq()
                .map(([key, property]) => {
                      return(
                        <MenuItem key={key} active={activePropertyIds.indexOf(property.id) > -1} eventKey={property.id}>{property.name}</MenuItem>
                      );
                  })}
              </DropdownButton>
          }
          </div>
          :
          <div>No products in this group</div>
        }
      </div>
    );
  }
}

GroupHistoryItemsList.propTypes = {
  products:              ImmutablePropTypes.map,
  activeProductId:       PropTypes.number,
  activePropertyId:      PropTypes.number,
  activePropertyIds:     ImmutablePropTypes.list,
  onProductChange:       PropTypes.func,
  onPropertyChange:      PropTypes.func
};

export default GroupHistoryItemsList;
