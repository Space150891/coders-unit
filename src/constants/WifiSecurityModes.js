import Immutable from 'immutable';

const modes = {
  'OPEN'           : 'Open',
  'WEP_PSK'        : 'WEP + PSK',
  'WEP_SHARED'     : 'WEP Shared',
  'WPA_TKIP_PSK'   : 'WPA TKIP + PSK',
  'WPA_AES_PSK'    : 'WPA AES + PSK',
  'WPA_MIXED_PSK'  : 'WPA Mixed + PSK',
  'WPA_TKIP_ENT'   : 'WPA TKIP ENT',
  'WPA_AES_ENT'    : 'WPA AES ENT',
  'WPA_MIXED_ENT'  : 'WPA Mixed ENT',
  'WPA2_AES_PSK'   : 'WPA2 AES + PSK',
  'WPA2_TKIP_PSK'  : 'WPA2 TKIP + PSK',
  'WPA2_MIXED_PSK' : 'WPA2 Mixed + PSK',
  'WPA2_TKIP_ENT'  : 'WPA2 TKIP ENT',
  'WPA2_AES_ENT'   : 'WPA2 AES ENT',
  'WPA2_MIXED_ENT' : 'WPA2 Mixed ENT',
  'IBSS_OPEN'      : 'IBSS Open',
  'WPS_OPEN'       : 'WPS Open',
  'WPS_SECURE'     : 'WPA Secure',
  'UNKNOWN'        : 'Unknown'
};

export default Immutable.OrderedMap(modes);
