import PropTypes from 'prop-types';
import React                from 'react';
import ImmutablePropTypes   from 'react-immutable-proptypes';
import Immutable            from 'immutable';
import ThingHistoryItem     from 'components/Dashboard/Thing/History/ThingHistoryItem';

//"Items" because it can be either property or product
class ThingHistoryItemsList extends React.Component{

  constructor(props){
    super(props);
  }

  render(){

    let properties = this.props.properties || new Immutable.Map();

    return(
      <div className="history-properties">
        <div className="history-properties">
          {properties.length == 0 ? <div>No history available</div> : null}
          {properties
            .filter((property) => {return property.isNumeric})
            .entrySeq()
            .map(([key, property]) => {
              return(
                <ThingHistoryItem
                  key={key}
                  title={property.name}
                  onClick={() => {this.props.onPropertyChange(property.id)}}
                  isActive={ this.props.activePropertyId === property.id ? true : false }
                />
              );
          })}
        </div>
      </div>
    );
  }
}

ThingHistoryItemsList.propTypes = {
  properties:       ImmutablePropTypes.map,
  activePropertyId: PropTypes.number,
  onPropertyChange: PropTypes.func
};

export default ThingHistoryItemsList;
