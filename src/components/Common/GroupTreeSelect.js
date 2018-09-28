import PropTypes from 'prop-types';
import React              from 'react';
import iMatrixPropTypes   from 'utils/iMatrixPropTypes';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Immutable          from 'immutable';

class GroupTreeSelect extends React.Component{

  constructor(props){
    super(props);
    this.state = {map: new Immutable.Map()};
  }

  componentDidMount(){
    this._populateGroupsList(this.props.groups);
  }

  componentWillReceiveProps(newProps){
    this._populateGroupsList(newProps.groups);
  }

  /**
   *
   * @param node  - a current group node object
   * @param level - number representing the nesting level starting with 1
   * @param map   - Immutable.Map instance
   * @private
   */
  _plainImmutableMapFromList(node, level, map){
    map = map || new Immutable.Map();
    level = level || 1;
    if(node.__children != undefined){
      node.__children.map(function(node){
        map = this._plainImmutableMapFromList(node, level + 1, map);
      }.bind(this));
    }
    //No children? Good to add to the map
    let key = node.id;
    let name = '';
    //The number of hyphens represents the depth
    for(let i=1; i<=level; i++){
      name+='-';
    }
    name += node.name;
    return map.set(key, name);
  }

  /**
   *
   * @param groupsList
   * @private
   */
  _populateGroupsList(groupsList){
    if(groupsList.size > 0){
      this.setState({
        map: this._plainImmutableMapFromList(groupsList.get(0)).reverse()
      });
    }
  }

  render(){
    return(
      <select
        className="form-control"
        name="group"
        value={this.props.activeGroupId || '#'}
        onChange={this.props.onChange}>
        <option value="#" disabled>Choose Group</option>
        {this.state.map.map((name, key) => {
          return  <option value={key} key={key}>{name}</option>
        })}
      </select>
    );
  }

}

GroupTreeSelect.propTypes = {
  groups:         ImmutablePropTypes.list,
  activeGroupId:  PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.number]),
  onChange:       PropTypes.func
};

export default GroupTreeSelect;
