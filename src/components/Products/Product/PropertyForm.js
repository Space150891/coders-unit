import PropTypes             from 'prop-types';
import React                 from 'react';
import { Button, FormGroup } from 'react-bootstrap';
import CheckboxAndValueInput from 'components/Common/Input/CheckboxAndValueInput';
import iMatrixPropTypes      from 'utils/iMatrixPropTypes';
import ProductActions        from 'actions/Products/ProductActions';
import Property              from 'entities/Property';
import DataTypes             from 'constants/DataTypes';
import PropertyTypes         from 'constants/PropertyTypes';
import PropertyModes         from 'constants/PropertyModes';
import TimeWithGranularity   from 'components/Common/Input/TimeWithGranularityInput';
import StatesInput           from 'components/Common/Input/StatesInput';
//import InputCollection     from 'components/Common/InputCollection';

/**
 * This component runs its own state so we don't modify the original File draft until changes are saved
 * Since this component is not a FLUX container - that should be fine
 * The initial state is passed by props
 */
class PropertyForm extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      property: new Property()
    };

    //@TODO Remove once the componentWillReceiveProps() works again
    this.state = {
      property: props.property || new Property()
    };
  }

  componentWillReceiveProps(){
    //@TODO Investigate
    //This is the place to load state based on props, but it doesn't work anymore after we've moved to react 16
    //this.setState({property: nextProps.property || new Property()});
  }

  handleChange(event){

    let elementName = event.target.name;
    let newValue = null;
    if('checkbox' === event.target.type){
      newValue = event.target.checked;
    } else {
      newValue = event.target.value;
    }

    //@TODO Write a field collection component just for this kind of cases
    //Value has to be built based on values from multiple inputs
    //And then converted to an array (Immutable JS List)
    if(
      event.target.getAttribute('data-array-name')
      &&
      event.target.getAttribute('data-key-in-array')
    ){
      elementName = event.target.getAttribute('data-array-name');
      let key     = event.target.getAttribute('data-key-in-array');
      let current = this.state.property.get(elementName);
      newValue = current.set(key, newValue);
    }

    if(newValue.length === 0) newValue = null;
    this.setState(prevState => ({property: prevState.property.set(elementName, newValue)}));
  }

  handleStatesChange(newValue){
    this.setState(prevState => ({property: prevState.property.set('states', newValue)}));
  }

  handleWarningsUseChange(event){

    let elementName = event.target.name;
    let newValue = null;

    //@TODO Maybe there is a more generic way of handling this?
    if(event.target.getAttribute('data-bit-position')){
      let n = event.target.getAttribute('data-bit-position');
      let bitVal = event.target.checked;
      let current = this.state.property.get(elementName);
      current ^= (-bitVal ^ current) & (1 << n);
      newValue = current;
    }

    this.setState(prevState => ({property: prevState.property.set(elementName, newValue)}));
  }

  handleSampleModeChange(event) {
    const newValue = event.target.value;
    switch (newValue) {
      case 'eventDriven':
        this.setState(prevState => ({property: prevState.property.set('sampleRate', 0)}));
        break;
      case 'sampleRate':
        this.setState(prevState => ({property: prevState.property.set('sampleRate', 60000)}));
        break;
    }
  }

  handleCustomWidgetChange(event){
    let elementName = event.name;
    let newValue = event.value;
    this.setState(prevState => ({property: prevState.property.set(elementName, newValue)}));
  }

  warningUseAllOff(){
    this.setState(prevState => (
      {property: prevState.property.merge({
        useWarningLevelLow:  0,
        useWarningLevelHigh: 0
      })}));
  }

  warningUseAllOn(){
    this.setState(prevState => (
      {property: prevState.property.merge({
        useWarningLevelLow:  7,
        useWarningLevelHigh: 7
      })}));
  }

  render(){
    return (
      <div className="form-control-edit">
        <FormGroup className="inline-label-120">
          <label htmlFor="name">
            Name
          </label>
          <input
            className="form-control"
            type="text"
            name="name"
            value={this.state.property.get('name')}
            onChange={this.handleChange.bind(this)}/>
        </FormGroup>
        <div className="row">
          <div className="col-xs-12 col-md-12">
            <FormGroup className="inline-label-120">
              <label htmlFor="type">
                Type
              </label>
              <select
                className="form-control"
                name="type"
                value={this.state.property.get('type')}
                onChange={this.handleChange.bind(this)}>
                <option value={PropertyTypes.get('PROPERTY_TYPE_CONTROL')}>Control</option>
                <option value={PropertyTypes.get('PROPERTY_TYPE_SENSOR')}>Sensor</option>
              </select>
            </FormGroup>
          </div>
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-120">
              <label htmlFor="units">
                Units
              </label>
              <input
                className="form-control"
                type="text"
                name="units"
                value={this.state.property.get('units')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
          </div>
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-120">
              <label htmlFor="mode">
                Mode
              </label>
              <select
                className="form-control"
                name="mode"
                value={this.state.property.get('mode')}
                onChange={this.handleChange.bind(this)}>
                <option value={PropertyModes.get('PROPERTY_MODE_UNITS')}>Scalar</option>
                <option value={PropertyModes.get('PROPERTY_MODE_STATEFUL')}>Stateful</option>
              </select>
            </FormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-120">
              <label htmlFor="type">
                Type
              </label>
              <select
                className="form-control"
                name="ioType"
                value={this.state.property.get('ioType')}
                onChange={this.handleChange.bind(this)}>
                <option value={0}>DOUT</option>
                <option value={1}>AOUT</option>
              </select>
            </FormGroup>
          </div>
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-120">
              <label htmlFor="dataType">
                Data Type
              </label>
              <select
                className="form-control"
                name="dataType"
                value={this.state.property.get('dataType')}
                onChange={this.handleChange.bind(this)}>
                {DataTypes.entrySeq().map((entry) => {return <option value={entry[0]} key={entry[0]}>{entry[1]}</option>})}
              </select>
            </FormGroup>
          </div>
          <div className="col-xs-12 col-sm-6">
            <FormGroup>
              <label htmlFor="sendOnPercentChange">
                Send On Percent Change
              </label>
              <CheckboxAndValueInput
                name="sendOnPercentChange"
                value={this.state.property.get('sendOnPercentChange')}
                onValueChange={this.handleCustomWidgetChange.bind(this)}
              />
            </FormGroup>
          </div>
          <div className="col-xs-12 col-sm-6">
            <FormGroup>
              <label htmlFor="defaultValue">
                Default Value
              </label>
              <CheckboxAndValueInput
                name="defaultValue"
                value={this.state.property.get('defaultValue')}
                onValueChange={this.handleCustomWidgetChange.bind(this)}
              />
            </FormGroup>
          </div>
        </div>
        {this.state.property.isModeStateful ?
          <div>
            <h4>States</h4>
            <FormGroup>
              <label htmlFor="states">
                <StatesInput
                  type="text"
                  name="states"
                  rows={this.state.property.get('states').toList()}
                  onChange={this.handleStatesChange.bind(this)}/>
              </label>
            </FormGroup>
          </div>
          :
          null
        }
        <h4>Flags</h4>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-200">
              <label htmlFor="isEnabled">
                Enabled
              </label>
              <input
                name="isEnabled"
                type="checkbox"
                checked={this.state.property.get('isEnabled')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
          </div>
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-200">
              <label htmlFor="sendToCloud">
                Send to Cloud
              </label>
              <input
                name="sendToCloud"
                type="checkbox"
                checked={this.state.property.get('sendToCloud')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-200">
              <label htmlFor="isArduinoModule">
                iMatrix Arduino Module
              </label>
              <input
                name="isArduinoModule"
                type="checkbox"
                checked={this.state.property.get('isArduinoModule')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
          </div>
        </div>
        <h4>Sample</h4>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <FormGroup>
              <div className="property">
                <input type="radio" name="sampleMode" value="eventDriven" checked={this.state.property.get('sampleRate') == 0 ? true : false} onChange={this.handleSampleModeChange.bind(this)}/> Event Driven
              </div>
              <div className="property">
                <input type="radio" name="sampleMode" value="sampleRate"  checked={this.state.property.get('sampleRate') == 0 ? false : true} onChange={this.handleSampleModeChange.bind(this)}/> Sample Rate
              </div>
            </FormGroup>
          </div>
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-120">
              <label htmlFor="pollRate">
                Poll Rate
              </label>
              <TimeWithGranularity
                name="pollRate"
                value={this.state.property.get('pollRate')}
                onValueChange={this.handleCustomWidgetChange.bind(this)}
              />
            </FormGroup>
          </div>
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-120">
              <label htmlFor="sampleRate">
                Sample Rate
              </label>
              <input
                className="form-control"
                type="text"
                name="sampleRate"
                value={this.state.property.get('sampleRate')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
          </div>
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-120">
              <label htmlFor="sampleBatchSize">
                Batch Size
              </label>
              <input
                className="form-control"
                type="text"
                name="sampleBatchSize"
                value={this.state.property.get('sampleBatchSize')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
          </div>
        </div>
        <h4>Tsunami Warning Thresholds</h4>
        <div className="warning-thresholds">
          <div className="row">
            <div className="col-xs-12">
              <div className="actions">
                <a href="#" onClick={this.warningUseAllOn.bind(this)}>All On</a>
                <a href="#" onClick={this.warningUseAllOff.bind(this)}>All Off</a>
              </div>
            </div>
            <div className="col-xs-12 col-md-12">
              <FormGroup>
                <label htmlFor="warningThresholds">
                  Watch
                </label>
                <input
                  className="form-control-inline input-width-60"
                  type="text"
                  name="warningThresholds[0]"
                  value={this.state.property.get('warningThresholds').get(0)}
                  onChange={this.handleChange.bind(this)}
                  data-array-name="warningThresholds"
                  data-key-in-array="0"
                  placeholder="Low"
                />
                <input
                  name="useWarningLevelLow"
                  type="checkbox"
                  checked={this.state.property.get('useWarningLevelLow') & 0x01}
                  data-bit-position={0}
                  onChange={this.handleWarningsUseChange.bind(this)}/>
                <input
                  className="form-control-inline input-width-60"
                  type="text"
                  name="warningThresholds[1]"
                  value={this.state.property.get('warningThresholds').get(1)}
                  onChange={this.handleChange.bind(this)}
                  data-array-name="warningThresholds"
                  data-key-in-array="1"
                  placeholder="High"
                />
                <input
                  name="useWarningLevelHigh"
                  type="checkbox"
                  checked={this.state.property.get('useWarningLevelHigh') & 0x01}
                  data-bit-position={0}
                  onChange={this.handleWarningsUseChange.bind(this)}/>
              </FormGroup>
            </div>
            <div className="col-xs-12 col-md-12">
              <FormGroup>
                <label htmlFor="warningThresholds">
                  Advisory
                </label>
                <input
                  className="form-control-inline input-width-60"
                  type="text"
                  name="warningThresholds[2]"
                  value={this.state.property.get('warningThresholds').get(2)}
                  onChange={this.handleChange.bind(this)}
                  data-array-name="warningThresholds"
                  data-key-in-array="2"
                  placeholder="Low"
                />
                <input
                  name="useWarningLevelLow"
                  type="checkbox"
                  checked={this.state.property.get('useWarningLevelLow') & 0x02}
                  data-bit-position={1}
                  onChange={this.handleWarningsUseChange.bind(this)}/>
                <input
                  className="form-control-inline input-width-60"
                  type="text"
                  name="warningThresholds[3]"
                  value={this.state.property.get('warningThresholds').get(3)}
                  onChange={this.handleChange.bind(this)}
                  data-array-name="warningThresholds"
                  data-key-in-array="3"
                  placeholder="High"
                />
                <input
                  name="useWarningLevelHigh"
                  type="checkbox"
                  checked={this.state.property.get('useWarningLevelHigh') & 0x02}
                  data-bit-position={1}
                  onChange={this.handleWarningsUseChange.bind(this)}/>
              </FormGroup>
            </div>
            <div className="col-xs-12 col-md-12">
              <FormGroup>
                <label htmlFor="warningThresholds">
                  Warning
                </label>
                <input
                  className="form-control-inline input-width-60"
                  type="text"
                  name="warningThresholds[4]"
                  value={this.state.property.get('warningThresholds').get(4)}
                  onChange={this.handleChange.bind(this)}
                  data-array-name="warningThresholds"
                  data-key-in-array="4"
                  placeholder="Low"
                />
                <input
                  name="useWarningLevelLow"
                  type="checkbox"
                  checked={this.state.property.get('useWarningLevelLow') & 0x04}
                  data-bit-position={2}
                  onChange={this.handleWarningsUseChange.bind(this)}/>
                <input
                  className="form-control-inline input-width-60"
                  type="text"
                  name="warningThresholds[5]"
                  value={this.state.property.get('warningThresholds').get(5)}
                  onChange={this.handleChange.bind(this)}
                  data-array-name="warningThresholds"
                  data-key-in-array="5"
                  placeholder="High"
                />
                <input
                  name="useWarningLevelHigh"
                  type="checkbox"
                  checked={this.state.property.get('useWarningLevelHigh') & 0x04}
                  data-bit-position={2}
                  onChange={this.handleWarningsUseChange.bind(this)}/>
              </FormGroup>
            </div>
          </div>
        </div>
        <h4>Values range</h4>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-120">
              <label htmlFor="min">
                MIN
              </label>
              <input
                className="form-control"
                type="text"
                name="min"
                value={this.state.property.get('min')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
          </div>
          <div className="col-xs-12 col-md-6">
            <FormGroup className="inline-label-120">
              <label htmlFor="max">
                MAX
              </label>
              <input
                className="form-control"
                type="text"
                name="max"
                value={this.state.property.get('max')}
                onChange={this.handleChange.bind(this)}/>
            </FormGroup>
          </div>
        </div>
        <div className="actions">
          <Button bsStyle="success" className="btn-raised" onClick={() => {ProductActions.formPropertySave(this.props.propertyKey, this.state.property)}}>Save</Button>
        </div>
      </div>
    );
  }
}

PropertyForm.propTypes = {
  property:    PropTypes.oneOfType([iMatrixPropTypes.null, PropTypes.object]), //Either a property Record object or null for the new property
  propertyKey: PropTypes.number
}

export default PropertyForm;
