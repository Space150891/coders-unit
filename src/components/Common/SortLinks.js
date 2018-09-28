import PropTypes          from 'prop-types';
import React              from 'react';
import iMatrixPropTypes   from 'utils/iMatrixPropTypes';
import ImmutablePropTypes from 'react-immutable-proptypes';

class SortLinks extends React.Component{

  constructor(props){
    super(props);
  }

  _getFaByOrder(order){
    order = (1 === order || -1 === order) ? order : 1;
    return (1 === order) ?
      <i className="fa fa-sort-asc" aria-hidden="true"></i>
      :
      <i className="fa fa-sort-desc" aria-hidden="true"></i>
      ;
  }

  render(){
    return(
      <div className="sort">
        {this.props.orderByOptions.entrySeq().map(function([orderByOption, orderByCaption]){
          return(
            <div className="sort-item" key={orderByOption}>
              <a
                href="#"
                className={orderByOption == this.props.activeOrderBy ? 'active' : null}
                onClick={function(){this.props.onChange(orderByOption, -this.props.activeOrder)}.bind(this)}>
                {orderByCaption}
              </a>
              {orderByOption == this.props.activeOrderBy ? this._getFaByOrder(this.props.activeOrder) : null}
            </div>
          );
        }.bind(this))}
      </div>
    );
  }

}

SortLinks.propTypes = {
  orderByOptions: ImmutablePropTypes.map, // option => caption e.g. 'sn' => 'Serial Number'
  onChange:       PropTypes.func, //cb(orderBy, order)
  activeOrderBy:  PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.string]),
  activeOrder:    PropTypes.oneOf([1, -1])
};

export default SortLinks;
