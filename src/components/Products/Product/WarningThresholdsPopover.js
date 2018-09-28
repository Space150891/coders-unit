import React from 'react';
import Immutable from 'immutable';
import { Popover, OverlayTrigger } from 'react-bootstrap';

class WarningThresholdsPopover extends React.Component{

  constructor(props){
    super(props);
  }

  render(){
    return(
      <OverlayTrigger trigger={['hover', 'focus']} placement="top" overlay={
        <Popover id={'data-sensor-warning-thresholds-' + this.props.popoverKey}>
          {this.props.warningThresholds ?
            <table className="warning-thresholds-table">
              <tbody>
                <tr>
                  <th>Level</th>
                  <th>Low</th>
                  <th>High</th>
                </tr>
                <tr>
                  <td>Normal</td>
                  <td>{this.props.warningThresholds.get(0) || 'N/A'}</td>
                  <td>{this.props.warningThresholds.get(1) || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Watch</td>
                  <td>{this.props.warningThresholds.get(2) || 'N/A'}</td>
                  <td>{this.props.warningThresholds.get(3) || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Advisory</td>
                  <td>{this.props.warningThresholds.get(4) || 'N/A'}</td>
                  <td>{this.props.warningThresholds.get(5) || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Warning</td>
                  <td>{this.props.warningThresholds.get(6) || 'N/A'}</td>
                  <td>{this.props.warningThresholds.get(7) || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
            :
            'N/A'
          }
        </Popover>
      }>
        <a href="javascript:;" className="popover-trigger-icon">
          <i className="fa fa-info-circle" aria-hidden="true"></i>
        </a>
      </OverlayTrigger>
    );
  }
}

WarningThresholdsPopover.defaultProps = {
  popoverKey: Math.random(),
  warningThresholds: new Immutable.List()
};

export default WarningThresholdsPopover;
