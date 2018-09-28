import _               from 'lodash';
import React           from 'react';
import { Container }   from 'flux/utils';
import {  Link }       from 'react-router';
import { ButtonGroup } from 'react-bootstrap';
import GroupTypes      from 'constants/GroupTypes';
import GroupActions    from 'actions/Groups/GroupActions';
import GroupStore      from 'stores/Groups/GroupStore';
import SpinnerCog      from 'components/SpinnerCog';
import GroupMapIndoor  from 'components/Groups/Group/Locations/GroupMapIndoor';
import GroupMapOutdoor from 'components/Groups/Group/Locations/GroupMapOutdoor';
import GroupThingItem  from 'components/Groups/Group/GroupThingItem';

class Group extends React.Component{

  constructor(props){
    super(props);
  }

  static getStores() {
    return [GroupStore];
  }

  static calculateState() {
    return GroupStore.getState();
  }

  componentDidMount(){
    if(this.state.group.get('id') != this.props.params.groupId){
      GroupActions.load(this.props.params.groupId)
        .then(() => {
          GroupActions.loadProducts(this.props.params.groupId);
          GroupActions.loadThings(this.props.params.groupId);
        });
    }
    // this.updateTimer = setInterval(() => {
    //   if(true === this.state.doLiveUpdate){
    //     //GroupActions.loadThings(this.props.params.groupId);
    //   }
    // }, 10000);
  }

  componentWillReceiveProps(nextProps){
    //@TODO - if it's the same indoor base - don't reload
    if(this.state.group.get('id') != nextProps.params.groupId){
      GroupActions.load(nextProps.params.groupId)
        .then(() => {
          GroupActions.loadProducts(nextProps.params.groupId);
          GroupActions.loadThings(nextProps.params.groupId);
        });
    }
  }

  componentWillUnmount(){
    // clearInterval(this.updateTimer);
  }

  getCurrentIndoorBase(){
    return this.findIndoorBaseOf(this.state.tree, this.state.group.get('id'));
  }

  findIndoorBaseOf(tree, groupId){

    //@TODO Do this in a utility class
    let findById = function(data, id) {
      for(var i = 0; i < data.length; i++) {
        if (data[i].id == id) {
          return data[i];
        } else if (_.get(data[i], '__children.length', 0) > 0) {
          let match = findById(data[i].__children, id);
          if(match) return match;
        }
      }
      return false;
    }

    let findParentOfTypeOfId = function(data, parentType, id){
      for(var i = 0; i < data.length; i++) {
        if(data[i].type == parentType){
          let match = findById([data[i]], id);
          if(match) return data[i];
        } else if(_.get(data[i], '__children.length', 0) > 0){
          let match = findParentOfTypeOfId(data[i].__children, parentType, id);
          if(match) return match;
        }
      }
      return false;
    }

    if(_.get(tree, 'length', 0) > 0 && typeof groupId === 'number' ){

      //We do not simply return the current group if it's an indoor base one because it does not contain children
      //So instead we do a tree lookup
      if(this.state.group.isIndoorBase){
        return findById(tree, groupId);
      }

      if(this.state.group.isIndoor){
        return findParentOfTypeOfId(
          tree,
          GroupTypes.get('GROUP_TYPE_INDOOR_BASE'),
          groupId,
          {}
        );
      }
    }

    return false;
  }

  render(){

    let isLoading = this.state.isLoading;

    if(isLoading){
      return(
        <div className="view-group">
          <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
        </div>
      );
    }

    let indoorBase = this.getCurrentIndoorBase();

    return(
      <div className="view-group">
        <div className="title">
          <h3>
            {this.state.group.get('title')}
          </h3>
          <div className="switch">
            <ButtonGroup>
              <Link
                disabled={isLoading}
                className={'btn btn-default active'}
                to={'/groups/' + this.props.params.groupId + '/locations'}>
                Locations
              </Link>
              <Link
                disabled={isLoading}
                className={'btn btn-default'}
                to={'/groups/' + this.props.params.groupId + '/history'}>
                History
              </Link>
            </ButtonGroup>
          </div>
          {/*<div className="toggle">*/}
            {/*<Toggle*/}
              {/*onToggle={() => {*/}
                {/*GroupActions.changeLiveUpdates(!this.state.doLiveUpdate);*/}
              {/*}}*/}
              {/*value={this.state.doLiveUpdate}*/}
              {/*colors={{*/}
                {/*active:   {base: ThemeVars.toggleColorActiveBase  , hover: ThemeVars.toggleColorActiveHover  },*/}
                {/*inactive: {base: ThemeVars.toggleColorInactiveBase, hover: ThemeVars.toggleColorInactiveHover}*/}
              {/*}}*/}
          {/*/>*/}
          {/*</div>*/}
          {/*<div className="toggle-label">*/}
            {/*Live Update*/}
          {/*</div>*/}
        </div>
        <div>
          <div className="map">
            {indoorBase ?
              <GroupMapIndoor
                tileUrl={indoorBase.tileUrl}
                products={this.state.products}
                things={this.state.things.toArray()}
                indoorBase={indoorBase}
                selectedThingId={this.state.selectedThingId || null}
                selectedIndoorGroupId={this.props.params.groupId || null}
                dimX={indoorBase.dimX}
                dimY={indoorBase.dimY}
              />
              :
              <GroupMapOutdoor
                group={this.state.group}
                things={this.state.things}
                geoJson={this.state.group.get('areaGeoJson')}
                selectedThingId={this.state.selectedThingId || null}/>
            }
          </div>
          <div className="things row">
            {!this.state.things.isEmpty() ?
              this.state.things.entrySeq().map(([key, thing]) => {
                return(
                  <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6" key={key}>
                    <GroupThingItem
                      thing={thing}
                      isActive={this.state.selectedThingId == thing.get('id') ? true : false}
                      onClick={() => {GroupActions.selectThing(thing.get('id'))}}/>
                  </div>
                );
              })
              :
              'No things available'
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Container.create(Group);
