'use strict';

import Immutable          from 'immutable';
import Platform           from 'entities/Platform';
import Product            from 'entities/Product';
import DataTypes          from 'constants/DataTypes';
import PropertyTypes      from 'constants/PropertyTypes';
import PropertyModes      from 'constants/PropertyModes';
import PropertySubmission from 'data_managers/submissions/PropertySubmission';

class Property extends Immutable.Record({
  id:                  null,
  type:                0,
  name:                '',
  units:               '',
  ioType:              0,
  defineAs:            '',
  dataType:            DataTypes.get('int32'),
  defaultValue:        null,
  product:             new Product(),
  platform:            new Platform(),
  warningThresholds:   new Immutable.List([0,0,0,0,0,0]),
  states:              new Immutable.List(),
  mode:                0,
  min:                 0,
  max:                 0,
  isArduinoModule:     false,
  initModule:          '',
  updateModule:        '',
  //sourceGenerationGroup
  sampleRate:          60000,
  pollRate:            1000,
  sampleBatchSize:     15,
  isEnabled:           true,
  sendToCloud:         true,
  sendOnPercentChange: null,
  useWarningLevelLow:  0,
  useWarningLevelHigh: 0
}){

  get isSensor(){
    return this.type == PropertyTypes.get('PROPERTY_TYPE_SENSOR')
  }

  get isControl(){
    return this.type == PropertyTypes.get('PROPERTY_TYPE_CONTROL')
  }

  get isModeUnits(){
    return this.mode == PropertyModes.get('PROPERTY_MODE_UNITS')
  }

  get isModeStateful(){
    return this.mode == PropertyModes.get('PROPERTY_MODE_STATEFUL')
  }

  get isNumeric(){
    return [
      DataTypes.get('int32'),
      DataTypes.get('uint32'),
      DataTypes.get('float')
    ].indexOf(this.dataType) != -1
  }

  get submission(){
    return new PropertySubmission({
      id:                  this.id,
      type:                this.type,
      name:                this.name,
      units:               this.units,
      ioType:              this.ioType,
      defineAs:            this.defineAs,
      dataType:            this.dataType,
      defaultValue:        this.defaultValue,
      product:             this.product,
      warningThresholds:   this.warningThresholds,
      states:              this.states,
      mode:                this.mode,
      min:                 this.min,
      max:                 this.max,
      isArduinoModule:     this.isArduinoModule,
      sampleRate:          this.sampleRate,
      pollRate:            this.pollRate,
      sampleBatchSize:     this.sampleBatchSize,
      isEnabled:           this.isEnabled ,
      sendToCloud:         this.sendToCloud,
      sendOnPercentChange: this.sendOnPercentChange,
      useWarningLevelLow:  this.useWarningLevelLow,
      useWarningLevelHigh: this.useWarningLevelHigh
    });
  }

}

export default Property;
