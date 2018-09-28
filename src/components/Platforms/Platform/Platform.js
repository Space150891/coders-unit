import React           from 'react';
import { Container }   from 'flux/utils';
import PlatformStore   from 'stores/Platforms/PlatformStore';
import PlatformActions from 'actions/Platforms/PlatformActions';
import SensorsList     from 'components/Platforms/Platform/SensorsList';
import ControlsList    from 'components/Platforms/Platform/ControlsList';
import SpinnerCog      from 'components/SpinnerCog';
import { Link }        from 'react-router';
import { Alert }       from 'react-bootstrap';

class Platform extends React.Component{

  constructor(props){
    super(props);

    //The following is moved here because the componentDidMount (and willMount) are called after the initial state is assigned
    //So when component changes - it first renders the previous state of newly rendered one and only then starts loading sequence
    PlatformActions.load(props.params.id);
  }

  static getStores(){
    return [PlatformStore];
  }

  static calculateState(){
    return PlatformStore.getState();
  }

  componentWillMount(){}

  componentWillReceiveProps(nextProps){
    if(nextProps.params.id != this.props.params.id){
      PlatformActions.load(nextProps.params.id);
    }
  }

  render(){

    if(true === this.state.isLoading){
      return <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
    }

    if(this.state.platform){

      return(<div className="view-platform">
        <div className="title">
          <h3>{this.state.platform.get('name')|| 'N/A'}</h3>
        </div>
        {this.state.alerts.map((message, key)=> {
          return <Alert key={key} bsStyle={message.level}>
            {message.messageText}
          </Alert>
        })}
        <div className="details">
          <div>Platform:  {this.state.platform.get('platform').name || 'N/A'}</div>
          <div>ID:        <span className="hex">{this.state.platform.get('id') && this.state.platform.get('id') .toString ? '0x0' + this.state.platform.get('id') .toString(16) : 'NEW'}</span></div>
        </div>
        <div className="sensors">
          <h3>Sensors</h3>
          <SensorsList data={this.state.platform.get('sensors')}/>
        </div>
        <div className="controls">
          <h3>Controls</h3>
          <ControlsList data={this.state.platform.get('controls')}/>
        </div>
      </div>);

    }

    return(
      <div>
        {this.state.alerts.map((message, key)=> {
          return <Alert key={key} bsStyle={message.level}>
            {message.messageText}
          </Alert>
        })}
      </div>
    );

  }

}

export default Container.create(Platform);
