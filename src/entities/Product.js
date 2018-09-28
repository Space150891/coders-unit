'use strict';

import Immutable         from 'immutable';
import Platform          from 'entities/Platform';
import WifiSecurityModes from 'constants/WifiSecurityModes';
import PropertyTypes     from 'constants/PropertyTypes';
import ProductSubmission from 'data_managers/submissions/ProductSubmission';

class Product extends Immutable.Record({
  id:                           null,
  name:                         '',
  shortname:                    '',
  platform:                     new Platform(),
  organization:                 {},
  isPublished:                  false,
  isAtCommandMode:              true,
  doStartInStationMode:         true,
  doLogWifiAp:                  true,
  doLogWifiRssi:                true,
  doLogWifiRfNoise:             true,
  interface:                    1, //@TODO Move interfaces to the constants too
  properties:                   new Immutable.Map(),
  things:                       new Immutable.Map(),
  disabledIntegratedProperties: new Immutable.Set(),
  photoFileUri:                 '',
  iconFileUri:                  '',
  defaultApSsid:                '',
  defaultApKey:                 '',
  defaultApSecurityMode:        WifiSecurityModes.keySeq().first(),
  wifiScanTime:                 14400,
  wifiScanPeriod:               7200,
  wifiDoScanOnSchedule:         true,
  wifiDoScanAtTime:             false,
  wifiDoReportWifiScan:         true,
  wifiDoScanForBestAP:          true,
  doScanForBleThings:           true,
  doReportBleThings:            true
}){

  get sensors(){
    return this.properties.filter((property) => {
      return property.type === PropertyTypes.PROPERTY_TYPE_SENSOR;
    })
  }

  get controls(){
    return this.properties.filter((property) => {
      return property.type === PropertyTypes.PROPERTY_TYPE_CONTROL;
    })
  }

  get submission(){
    return new ProductSubmission({
      id:                           this.id,
      name:                         this.name,
      shortname:                    this.shortname,
      platform:                     this.platform.id,
      isPublished:                  this.isPublished,
      isAtCommandMode:              this.isAtCommandMode,
      doStartInStationMode:         this.doStartInStationMode,
      doLogWifiAp:                  this.doLogWifiAp,
      doLogWifiRssi:                this.doLogWifiRssi,
      doLogWifiRfNoise:             this.doLogWifiRfNoise,
      interface:                    this.interface,
      properties:                   this.properties.map((v) => {return v.submission}),
      disabledIntegratedProperties: this.disabledIntegratedProperties,
      photoFileUri:                 this.photoFileUri,
      iconFileUri:                  this.iconFileUri,
      defaultApSsid:                this.defaultApSsid,
      defaultApKey:                 this.defaultApKey,
      defaultApSecurityMode:        this.defaultApSecurityMode,
      wifiScanTime:                 this.wifiScanTime,
      wifiScanPeriod:               this.wifiScanPeriod,
      wifiDoScanOnSchedule:         this.wifiDoScanOnSchedule,
      wifiDoScanAtTime:             this.wifiDoScanAtTime,
      wifiDoReportWifiScan:         this.wifiDoReportWifiScan,
      wifiDoScanForBestAP:          this.wifiDoScanForBestAP,
      doScanForBleThings:           this.doScanForBleThings,
      doReportBleThings:            this.doReportBleThings
    });
  }

}

export default Product;
