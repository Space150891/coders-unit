import defaultThemeVars from 'default_theme_vars';

export default Object.assign(defaultThemeVars, {

  //By default - there is no organization binding
  //This has effect on many aspects - like the registration process
  organizationId: 1588379481,

  //Branding
  brandName:     'Arrow ACT',
  headerlogoUrl: 'http://iot.arrow.com',

  //Gauges
  gaugeColorStart:  '#02A19B',
  gaugeColorStop:   '#02928d',
  gaugeStrokeColor: '#484848',

  //Toggles
  toggleColorActiveBase:    'rgb(2,161,155)',
  toggleColorActiveHover:   'rgb(2,161,155)',
  toggleColorInactiveBase:  'rgb(65,66,68)',
  toggleColorInactiveHover: 'rgb(65,66,68)'

});
