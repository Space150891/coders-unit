import React                              from 'react';
import GaugeLib                           from '../../../../vendors/gauge';
import { Tooltip, OverlayTrigger, Label } from 'react-bootstrap';
import ThemeVars                          from 'theme_vars';

class GaugeComponent extends React.Component{

  constructor(props){

    super(props);

    this.options = {
      lines:     12,     // The number of lines to draw
      angle:     0,      // The span of the gauge arc
      lineWidth: 0.20,   // The line thickness
      pointer: {
        length:      0.3,                 // The radius of the inner circle
        strokeWidth: 0.035,               // The thickness
        color: ThemeVars.gaugeStrokeColor // Fill color
      },
      limitMax: false,                        // If true, the pointer will not go past the end of the gauge
      colorStart:  ThemeVars.gaugeColorStart, // Colors
      colorStop:   ThemeVars.gaugeColorStop,  // just experiment with them
      strokeColor: '#f7f7f7',                 // to see which ones work best for you
      generateGradient: true,
      highDpiSupport: true,                   // High resolution support
      staticLabels: {
        font: '10px sans-serif',                   // Specifies font
        labels: [this.props.min, this.props.max],  // Print labels at these values
        fractionDigits: 0                          // Optional: Numerical precision. 0=round off.
      }
    };
  }

  componentDidMount(){
    try{
      let target = this.refs.canvas;
      this.gauge = new GaugeLib.Gauge(target);
      this.gauge.setOptions(this.options);
      this.gauge.maxValue = this.props.max;
      this.gauge.setMinValue(this.props.min);
      this.gauge.set(this.normalizeValue(this.props.value));
    } catch(err){console.error(err)}
  }

  componentWillUnmount(){
      if(undefined !== this.gauge){
        delete this.gauge;
      }
  }

  componentWillReceiveProps(nextProps){
    // this.gauge.maxValue = this.props.max;
    // this.gauge.setMinValue(this.props.min);
    this.gauge.set(this.normalizeValue(nextProps.value));
  }

  /**
   * Converts val to a Number()
   * Checks if it's float and leaves 2 decimal ponts if it is
   * @TODO May need to remove this once a better float handling mechanism is found
   * @param val
   */
  normalizeValue(val){
    val = Number(val);
    if(val % 1 != 0) val = parseFloat(val.toFixed(2));
    return val;
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
      <div className='gauge'>
        <h4>{this.props.label}</h4>
        {this.getStatus()}
        <canvas style={{'max-height': '120px', width: '250px', 'max-width': '100%'}} ref='canvas'></canvas>
        <div className='info'>
          <div className='value'>
            {this.normalizeValue(this.props.value)} {this.props.units}
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

