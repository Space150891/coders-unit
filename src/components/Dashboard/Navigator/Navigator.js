import React                          from 'react';
import {Container}                    from 'flux/utils';
import Immutable                      from 'immutable';
import NavigatorConstants             from 'constants/actions/Dashboard/Navigator';
import NavigatorStore                 from 'stores/Dashboard/NavigatorStore';
import NavigatorActions               from 'actions/Dashboard/NavigatorActions';
import { ButtonGroup, Button, Alert } from 'react-bootstrap';
import ThingsList                     from 'components/Dashboard/Navigator/ThingsList';
import GroupsList                     from 'components/Dashboard/Navigator/GroupsList';
import ScrollArea                     from 'react-scrollbar';
import SpinnerCog                     from 'components/SpinnerCog';
import SortLinks                      from 'components/Common/SortLinks';
import QuickFilterInput               from 'components/Common/QuickFilterInput';
import { Link }                       from 'react-router';

class Navigator extends React.Component{

  constructor(props){
    super(props);
    this.state = NavigatorStore.getState();
  }

  static getStores(){
    return [NavigatorStore];
  }

  static calculateState(){
    return NavigatorStore.getState();
  }

  componentDidMount(){
    NavigatorActions.loadGroupsList();
  }

  getContent(){

    if(this.state.error){
      return <Alert bsStyle="danger">{this.state.error}</Alert>;
    }

    if(true === this.state.isLoading){
      return <SpinnerCog> Loading...</SpinnerCog>;
    }

    if(this.state.thingsFiltered.size > 0){
      if(this.state.mode === NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS){
        return <ThingsList things={this.state.thingsFiltered} products={this.state.products}></ThingsList>
      }
    }

    // @TODO use filtered groups here
    if(this.state.groups.size > 0){
      if(this.state.mode === NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_GROUPS){
        return <GroupsList {...this.props} groups={this.state.groups}></GroupsList>
      }
    }

    return <div>Nothing to show</div>
  }

  render(){
    let isLoading = this.state.isLoading;
    return(
      <div id="navigator" className="well">
        <div className="switch">
          <ButtonGroup>
            <Button
              disabled={isLoading}
              className={this.state.mode === NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_GROUPS ? 'active' : null}
              onClick={!isLoading ? NavigatorActions.loadGroupsList  : null}>
              Groups
            </Button>
            <Button
              disabled={isLoading}
              className={this.state.mode === NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS ? 'active' : null}
              onClick={!isLoading ? NavigatorActions.loadThingsList : null}>
              Things
            </Button>
          </ButtonGroup>
        </div>
        {this.state.mode === NavigatorConstants.DASHBOARD_NAVIGATOR_MODE_THINGS ?
          <div className="header">
            <SortLinks
              orderByOptions = {new Immutable.Map({'sn' : 'S/N', 'name' : 'Name', 'product' : 'Product'})}
              onChange       = {NavigatorActions.sort}
              activeOrderBy  = {this.state.sort.orderBy}
              activeOrder    = {this.state.sort.order}
            />
            <QuickFilterInput
              searchInProperties = {['sn', 'name']}
              onChange           = {NavigatorActions.filter}
              placeholder        ={'Type to filter...'}
              classNames         ={['form-control']}
            />
            <div className="actions">
              <Link to={'/things/new'} className="btn btn-sm btn-success btn-raised">
                + New
              </Link>
            </div>
          </div>
          :
          null
        }
        <ScrollArea
          speed={0.7}
          smoothScrolling={true}
          horizontal={false}
        >
          <div className="content">
            {this.getContent()}
          </div>
        </ScrollArea>
      </div>
    );
  }

}

export default Container.create(Navigator);
