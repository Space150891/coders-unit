import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import StatefulPropertiesListItem from 'components/Dashboard/Thing/Readings/StatefulPropertiesListItem';

class StatefulPropertiesList extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    console.log(this.props.items);
    return(
      <div className="stateful-properties">
        {this.props.items.entrySeq().map(([key, item]) => {
          return(
            <StatefulPropertiesListItem
              name       = {item.name}
              value      = {item.value}
              units      = {item.units}
              isStateful = {item.mode}
              states     = {item.states}
              time       = {new Date(item.time).toLocaleString()}
              key        = {key}
            />
          );
        })}
      </div>
    );
  }

}

StatefulPropertiesList.propTypes = {
  items: ImmutablePropTypes.orderedMap
}

export default StatefulPropertiesList;
