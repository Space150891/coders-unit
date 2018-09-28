import PropTypes            from 'prop-types';
import React                from 'react';
import { DropdownButton, MenuItem }      from 'react-bootstrap';
import ImmutablePropTypes   from 'react-immutable-proptypes';
import Immutable            from 'immutable';

//"Items" because it can be either property or product
class ThingHistoryItemSelect extends React.Component{

  constructor(props){
    super(props);
  }

  render(){

    let properties = this.props.properties || new Immutable.Map();
    const { activePropertyIds, isLoading } = this.props;
    return(
      <div className="history-properties">
        <div className="history-properties">
          <DropdownButton
            disabled={isLoading}
            bsStyle={'success'}
            title={'Select a sensor'}
            onSelect={(e) => {
              this.props.onPropertyChange(e, properties)
            }}
            id={'dropdown-custom'}
            >
              {properties
              .filter((property) => {return property.isNumeric})
              .entrySeq()
              .map(([key, property]) => {
                return(
                  <MenuItem
                    key={key}
                    active={activePropertyIds.indexOf(property.id) > -1}
                    eventKey={property.id}>{property.name}
                  </MenuItem>
                );
              })}
          </DropdownButton>

        </div>
      </div>
    );
  }
}

ThingHistoryItemSelect.propTypes = {
  properties:       ImmutablePropTypes.map,
  activePropertyId: PropTypes.number,
  activePropertyIds: PropTypes.array,
  onPropertyChange: PropTypes.func
};

export default ThingHistoryItemSelect;
