'use strict';

import Immutable from 'immutable';
import WifiSecurityModes from 'constants/WifiSecurityModes';

const ProductSubmission = Immutable.Record({
  name: null,
  shortname: null,
  //@TODO load platforms by ajax call and set this to null
  platform: null,
  isPublished: false,
  isAtCommandMode: true,
  doStartInStationMode: true,
  doLogWifiAp: true,
  doLogWifiRssi: true,
  doLogWifiRfNoise: true,
  interface: 1,
  properties: [],
  disabledIntegratedProperties:  [],
  // photoFileUri: '',
  // iconFileUri: '',
  defaultApSsid: '',
  defaultApKey: '',
  defaultApSecurityMode: WifiSecurityModes.keySeq().first(),
  wifiScanTime:                 true,
  wifiScanPeriod:               true,
  wifiDoScanOnSchedule:         true,
  wifiDoScanAtTime:             false,
  wifiDoReportWifiScan:         true,
  wifiDoScanForBestAP:          true,
  doScanForBleThings:           true,
  doReportBleThings:            true,
});

export default ProductSubmission;
