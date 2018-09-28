import _                 from 'lodash';
import React             from 'react';
import { Container }     from 'flux/utils';
import PropTypes         from 'prop-types';
import {browserHistory}  from "react-router";
import iMatrixPropTypes  from "utils/iMatrixPropTypes";
import { Button, Alert, FormGroup } from 'react-bootstrap';
import SpinnerCog        from 'components/SpinnerCog';
import GroupActions      from "actions/Groups/GroupActions";
import ThingDataManager  from 'data_managers/ThingDataManager';
import GroupStore        from "stores/Groups/GroupStore";
import GroupTypes        from "constants/GroupTypes";
import GroupMapIndoor    from 'components/Groups/Group/Locations/GroupMapIndoor';

class IndoorBaseGroupForm extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      pointsToSave: {},
      discard: false,
      mapOnChange: false,
    }
    //The following is moved here because the componentDidMount (and willMount) are called after the initial state is assigned
    //So when component changes - it first renders the previous state of newly rendered one and only then starts loading sequence
    //Since the this.state is not available here - we use the store directly to check if this is the same product
    this.bootstrap(props.params.groupId);
    props.router.setRouteLeaveHook(props.route, this.onRouteLeave.bind(this));
  }

  static getStores(){
    return [GroupStore];
  }

  static calculateState(prevState){
    if(!prevState){
      let initialState = GroupStore.getState();
      initialState.confirmation        = null;
      initialState.isForwardingToRoute = false;
      return initialState;
    } else {
      let newState = GroupStore.getState();
      newState.confirmation        = prevState.confirmation;
      newState.isForwardingToRoute = prevState.isForwardingToRoute;
      return newState;
    }
  }

  bootstrap(id){
    if(id){
      GroupActions.formEditStart(id);
      GroupActions.load(id)
        .then(() => {
          GroupActions.loadProducts(id);
          GroupActions.loadThings(id);
        });
    } else {
      GroupActions.formCreate(GroupTypes.get('GROUP_TYPE_INDOOR'), this.props.params.parentId);
      GroupActions.loadTree().then(() => {
        GroupActions.formEditStart(null);
      })
    }
  }

  componentDidMount(){}

  componentWillReceiveProps(nextProps){
    if(nextProps.params.groupId != this.props.params.groupId){
      this.bootstrap(nextProps.params.groupId);
    }
    //Don't forget to set these back to default!
    this.setState({
      isForwardingToRoute: false,
      confirmation: null
    });
  }

  getCurrentIndoorBase(){
    const draft = this.state.draft.toJS();
    const _id = this.state.draft.toJS().id ==  this.state.group.get('id') ? this.state.group.get('parent') : this.state.group.get('id');
//    TODO: remove
    const res = this.findIndoorBaseOf(this.state.tree, _id, +this.props.params.parentId);
    if(!draft.id && draft.areaGeoJson.geometry && draft.areaGeoJson.geometry.coordinates.length > 0){
      res.__children.push(draft)
    }
    return res
  }

  findIndoorBaseOf(tree, groupId, parentId) {

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

    //If it's a new group - the indoor base is got to be searched for by the id found in params
    if(typeof groupId != 'number' && typeof parentId === 'number'  ){
      return findById(tree, parentId);
    }

    return false;
  }

  /**
   * this.props.router.setRouteLeaveHook is what sets these
   * @returns {boolean}
   */
  onRouteLeave(nextLocation){

    //Trying to go away while there are unsaved changes?
    if(GroupStore.hasChanged() && !this.state.isForwardingToRoute){
      this.setState((prevState) => {
        let newState = prevState;
        newState.confirmation = <Confirm
          visible={true}
          onConfirm={function(){
            //When we do forwarding, the same hook will be called again
            //We set a flag in the state to make sure we don't enter a loop
            this.setState({isForwardingToRoute: true, confirmation: null}, () => {
              browserHistory.transitionTo(nextLocation);
            });
          }.bind(this)}
          onClose={function(){
            this.setState({confirmation: null});
          }.bind(this)}
          body="You have unsaved items left, would you really like to leave?"
          confirmText="Leave"
          title="Confirmation Required">
        </Confirm>;
        return newState;
      });

      //@TODO Why it doesn't work without this?
      //Without the forceUpdate() the component just won't re-render
      this.forceUpdate();

      return false;
    }
  }

  handleChange(event){
    const elementName = event.target.name;
    const oldValue = this.state.draft.get(elementName);
    let newValue = null;
    if('checkbox' === event.target.type){
      newValue = event.target.checked;
    } else {
      newValue = event.target.value;
    }
    GroupActions.formValueChange(elementName, oldValue, newValue);
  }

  mapOnChange(type, layers, feature) {
    if (type === 'create') {
      const oldValue = {};
      GroupActions.formValueChange('areaGeoJson', oldValue, layers);
    } else {
      for (let key in layers) {
        let json = layers[key].toGeoJSON()
        if (json.geometry.type === 'Polygon') {
          const oldValue = _.clone(this.state.draft.get('areaGeoJson'));
          GroupActions.formValueChange('areaGeoJson', oldValue, json);
        } else if (json.geometry.type === 'Point') {
          let { id, group, name, owner, product, sn } = feature[key].options
          let inСycle = false
          var arr = _.clone(this.state.pointsToSave)
          for (let key in arr) {
            if (arr[key].id == id) {
              arr[key].json = json
              inСycle == true
              break
            }
          }
          if (!inСycle) {
            arr[key] = {
              id:id,
              json:json,
              group:group,
              name:name,
              owner:owner,
              product:product,
              sn:sn,
            }
          }
          this.setState({pointsToSave: arr})
        }
      }
    }
  }

  saveThings() {
    let pointsToSave = _.clone(this.state.pointsToSave)
    for (let key in pointsToSave) {
      let { id, json, group, name, owner, product, sn } = pointsToSave[key]
      ThingDataManager.update(id, {
        locX: json.geometry.coordinates[0],
        locY: json.geometry.coordinates[1],
        group:group,
        name:name,
        owner:owner,
        product:product,
        sn:sn,
      })
    }
    this.setState({pointsToSave: {}})
  }

  render(){
    if(true === this.state.isLoading) {
      return <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
    }
    let indoorBase = this.getCurrentIndoorBase();
    console.log('is empty', !_.isEmpty(this.state.pointsToSave))
    return(
      <div className="form-group">
        <div className="header">
          <div className="title">
            <h3>{this.state.name} Group Edit</h3>
            <Button bsStyle="danger"  className="btn-raised btn-delete" onClick={() => {
              GroupActions.formDelete(this.state.draft)
            }}>Delete</Button>
          </div>
        </div>
        <div className="form">
          {this.state.alerts.map((message, key)=> {
            return <Alert key={key} bsStyle={message.level}>
              {message.messageText}
            </Alert>
          })}
          <div className="row">
            <div className="col-xs-12">
              <FormGroup>
                <label htmlFor="name">
                  Name
                </label>
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  value={this.state.draft.get('name')}
                  onChange={this.handleChange.bind(this)}/>
              </FormGroup>
            </div>
          </div>
          <div className="view-group">
            <div>
              <div className="map">
                {indoorBase ?
                  <GroupMapIndoor
                    edit={true}
                    type={'Edit'}
                    feature={this.state.draft.get('areaGeoJson')}
                    mapOnChange={this.mapOnChange.bind(this)}
                    tileUrl={indoorBase.tileUrl}
                    products={this.state.products}
                    things={this.state.things.toArray()}
                    indoorBase={indoorBase}
                    selectedThingId={Number(this.state.selectedThingId) || null}
                    selectedIndoorGroupId={Number(this.props.params.groupId) || null}
                    dimX={indoorBase.dimX}
                    dimY={indoorBase.dimY}
                  />
                  :
                  null
                }
              </div>
            </div>
          </div>
        </div>
        {(GroupStore.hasChanged() || !_.isEmpty(this.state.pointsToSave))
          ?
          <div className="actions">
            <Button bsStyle="success" className="btn-raised" onClick={() => {
              if(this.state.draft.get('name')){
                this.saveThings()
                GroupActions.formSave(this.state.draft, this)
              } else {
                this.setState({alerts: [{level: 'danger', messageText: 'Name field must not be empty'}]})
              }
            }}>Save</Button>
            <Button bsStyle="danger"  className="btn-raised" onClick={() => {
              GroupActions.formDiscard(this.state.draft)
            }}>Discard</Button>
          </div>
          :
          null}
        {this.state.confirmation}
      </div>
    );
  }
}

IndoorBaseGroupForm.propTypes = {
  id: PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.number]), //Group id or null for the new Group
};

export default Container.create(IndoorBaseGroupForm);
