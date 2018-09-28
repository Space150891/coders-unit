import _                   from 'lodash';
import React               from 'react';
import GroupsListItem      from 'components/Dashboard/Navigator/GroupsListItem';
import ImmutablePropTypes  from 'react-immutable-proptypes';
import GroupLevels from "constants/GroupLevels";

class GroupsList extends React.Component{

  constructor(props){
    super(props);
  }

  renderTreeNode(node){
    let children;
    if(node.__children != undefined){
      children = node.__children.map(function(node){
        return this.renderTreeNode(node);
      }.bind(this));
    }

    return <GroupsListItem
      key={node.get('id')}
      id={node.get('id')}
      type={node.get('type')}
      lvl={node.get('lvl')}
      open={
        node.get('lvl') < GroupLevels.get('GROUP_LVL_BUILDING') ||
        this.getSubMenuItem(node.get('__children', null).toJS() ,_.get(this.props, 'path.groupId', null))
        // {_.get(this.state, ['inputsValidity', 'first', 'status'], null)}


      }
      parent={node.get('parent')}
      name={node.get('name')}
      activeId={_.get(this.props, 'path.groupId', null)}
      children={children}/>;
  }

  getSubMenuItem (subMenuItems, id) {
    if (subMenuItems) {
        for (var i = 0; i < subMenuItems.length; i++) {
            if (subMenuItems[i].id == id) {
                return subMenuItems[i];
            }
            var found = this.getSubMenuItem(subMenuItems[i].__children, id);
            if (found) return !!found;
        }
    }
  };

  render(){
    if(this.props.groups.size > 0){
      return(
        <div id="groups-list" className="list">
          {this.renderTreeNode(this.props.groups.get(0))}
        </div>
      );
    }

    return(<div id="groups-list" className="list">
      Nothing to show
    </div>);

  }

}

GroupsList.propTypes = {
  groups: ImmutablePropTypes.list
};

export default GroupsList;
