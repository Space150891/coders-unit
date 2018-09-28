import React                          from 'react';
import {Container}                    from 'flux/utils';
import NavigatorStore                 from 'stores/Platforms/NavigatorStore';
import { Alert }                      from 'react-bootstrap';
import PlatformsList                  from 'components/Platforms/Navigator/PlatformsList';
import SpinnerCog                     from 'components/SpinnerCog';
import { Link }                       from 'react-router'
import NavigatorActions               from 'actions/Platforms/NavigatorActions';

class Navigator extends React.Component{

  constructor(props){
    super(props);
  }

  static getStores(){
    return [NavigatorStore];
  }

  static calculateState(){
    return NavigatorStore.getState();
  }

  componentDidMount(){
    NavigatorActions.loadPlatformsList();
  }

  getContent(){

    if(this.state.error){
      return <Alert bsStyle="danger">{this.state.error}</Alert>;
    }

    if(true === this.state.isLoading){
      return <SpinnerCog> Loading...</SpinnerCog>;
    }

    if(this.state.data.length > 0){
      return <PlatformsList data={this.state.data}></PlatformsList>
    }

    return <div>Nothing to show</div>
  }

  render(){
    return(
      <div id="navigator" className="well">
        <div className="header">
        </div>
        <div className="content">
          {this.getContent()}
        </div>
      </div>
    );
  }

}

export default Container.create(Navigator);
