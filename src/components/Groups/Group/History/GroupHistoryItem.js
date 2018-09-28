import PropTypes from 'prop-types';
import React from 'react';
import cx from 'react-classset';

//"Item" because it can be either property or product
class GroupHistoryListItem extends React.Component{

  constructor(props){
    super(props);
  }

  render(){

    //https://eric.blog/2015/01/19/dynamically-add-classes-react-classset/
    //https://www.npmjs.com/package/react-classset
    var classes = cx({
      'btn': true,
      'btn-default': true,
      'btn-sm': true,
      'active': this.props.isActive
    });

    return(
      <div className="property">
        <a
          href="#"
          className={classes}
          onClick={this.props.onClick}>{this.props.title}</a>
      </div>
    );
  }

}

GroupHistoryListItem.propTypes = {
  title:   PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func
};

export default GroupHistoryListItem;