import _         from 'lodash';
import React     from 'react';
import PropTypes from 'prop-types';
import { Link }  from 'react-router';
import GroupTypes from "constants/GroupTypes";

class ThingsListItem extends React.Component{

  constructor(props){
    super(props);
    this.state = {childrenVisible: props.open};
  }

  handleClick(){
    let childrenVisible = !this.state.childrenVisible;
    this.setState({childrenVisible});
  }

  renderCollapseIndicator(){
    if(_.get(this.props, 'children.size', 0) > 0){
      return <a className={'icon collapse-indicator ' + (this.state.childrenVisible ? 'open' : 'closed')}></a>
    }
  }

  renderCreateLink(){

    //Can't create root groups
    //Can't create indoor under another indoor (well, we can, but let's block it for now)
    if([GroupTypes.get('GROUP_TYPE_ROOT'),
        GroupTypes.get('GROUP_TYPE_OUTDOOR_SITE'),
        GroupTypes.get('GROUP_TYPE_OUTDOOR_BUILDING'),
        GroupTypes.get('GROUP_TYPE_INDOOR_BASE')]
        .indexOf(this.props.type) != -1
      &&
      this.props.id
    ) {
      return <Link to={`/groups/${this.props.id}/${this.props.type + 1}/new`} className="icon second" activeClassName="active">
        <i className="fa fa-plus" aria-hidden="true"></i>
      </Link>;
    }

    return null;
  }

  renderEditLink(){

    //Can't edit root groups, so these are the ones to choose from
    if([GroupTypes.get('GROUP_TYPE_OUTDOOR_SITE'),
        GroupTypes.get('GROUP_TYPE_OUTDOOR_BUILDING'),
        GroupTypes.get('GROUP_TYPE_INDOOR_BASE'),
        GroupTypes.get('GROUP_TYPE_INDOOR')]
        .indexOf(this.props.type) != -1
      &&
        this.props.id
    ) {
      return <Link to={`/groups/${this.props.id}/${this.props.type}/edit`} className="icon third" activeClassName="active">
        <i className="fa fa-cog" aria-hidden="true"></i>
      </Link>;
    }

    return null;
  }

  render(){
    return(
      <div className={'group-item item type-' + this.props.type}>
        <div className="link">
          {this.renderCreateLink()}
          {this.renderEditLink()}
          <Link to={`/groups/${this.props.id}/locations`} activeClassName="active">
            {this.props.name}
          </Link>
          <span onClick={this.handleClick.bind(this)}>
            {this.renderCollapseIndicator()}
          </span>
        </div>
        <div className={'children ' + (this.state.childrenVisible ? 'visible' : null)}>
          {_.get(this.props, 'children', []).map((child) => {
            //If this items children children are hidden
            //Hide their children too
            //This doesn't work for displaying, only for hiding
            if(false === this.state.childrenVisible){
              //This is how you render react child with altered properties
              return React.cloneElement(child, {
                childrenVisible: false
              })
            }
            return child;
          })}
        </div>
      </div>
    );
  }

}

ThingsListItem.propTypes = {
  'childrenVisible': PropTypes.bool
};

export default ThingsListItem;
