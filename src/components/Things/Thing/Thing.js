import React         from 'react';
import { Container } from 'flux/utils';
import Confirm        from 'components/Common/Confirm';
import ThingStore   from 'stores/Things/ThingStore';
import ThingActions from 'actions/Things/ThingActions';
// import SensorsList    from 'components/Products/File/SensorsList';
// import ControlsList   from 'components/Products/File/ControlsList';
import SpinnerCog     from 'components/SpinnerCog';
import { Link }       from 'react-router';
import { Alert }      from 'react-bootstrap';

class Thing extends React.Component{

  constructor(props){
    super(props);
    ThingActions.load(props.params.id);
  }

  static getStores(){
    return [ThingStore];
  }

  static calculateState(){
    return ThingStore.getState();
  }

  componentDidMount(){}

  componentWillReceiveProps(nextProps){
    if(nextProps.params.id != this.props.params.id){
      ThingActions.load(nextProps.params.id);
    }
  }

  render(){

    if(true === this.state.isLoading){
      return <SpinnerCog fontSize="64px" color="#ccc" marginTop="45%" marginBottom="45%" marginLeft="50%"></SpinnerCog>
    }

    if(this.state.thing){

      return(<div className="view-thing">
        <div className="header">
          <div className="title">
            <h3>{this.state.thing.get('name')|| 'N/A'}</h3>
            <Link to={`/things/${this.props.params.id}/edit`} className="btn btn-xs btn-raised">
              Edit
            </Link>
            <Confirm
              onConfirm={function(){ThingActions.delete(this.props.params.id)}.bind(this)}
              body="Are you sure you want to delete this thing? This action cannot be undone."
              confirmText="Confirm Delete"
              title="Confirmation Required">
              <a href="#" className="btn btn-raised btn-xs btn-danger">
                Delete
              </a>
            </Confirm>
          </div>
        </div>
        {this.state.alerts.map((message, key)=> {
          return <Alert key={key} bsStyle={message.level}>
            {message.messageText}
          </Alert>
        })}
        <div className="details">
          <div>Serial Number:  {this.state.thing.get('sn')   || 'N/A'}</div>
          <div>Name:           {this.state.thing.get('name') || 'N/A'}</div>
          <div>ID:             <span className="hex">{this.state.thing.get('id') && this.state.thing.get('id') .toString ? '0x0' + this.state.thing.get('id') .toString(16) : 'NEW'}</span></div>
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

export default Container.create(Thing);
