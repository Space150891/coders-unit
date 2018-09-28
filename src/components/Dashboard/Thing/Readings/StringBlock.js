import React                              from 'react';
import { Tooltip, OverlayTrigger, Label } from 'react-bootstrap';

class GaugeComponent extends React.Component{

  constructor(props){
    super(props);
  }

  getStatus(){

    if(this.props.error){

      let code    = this.props.error.c;
      let time    = new Date(this.props.error.t * 1000).toLocaleString();
      let tooltip = <Tooltip id="tooltip"><strong>Error Code {code} {time} </strong> </Tooltip>;

      return(
        <OverlayTrigger placement="left" overlay={tooltip}>
          <Label bsStyle="danger">Error</Label>
        </OverlayTrigger>
      );

    } else {
      return(
        <Label bsStyle="success">OK</Label>
      );
    }
  }

  render(){
    return(
      <div className='string-block'>
        <h4>{this.props.label}</h4>
        {this.getStatus()}
        <div className='info'>
          <div className='value'>
            {this.props.value}
          </div>
          <div className='time'>
            {this.props.time}
          </div>
        </div>
      </div>
    );
  }
}

export default GaugeComponent;

