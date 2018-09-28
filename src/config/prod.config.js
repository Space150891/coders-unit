var config = {
  apiDomain:       'api.imatrix.io',
  apiProtocol:     'https',
  apiClientId:     '2_nfok9ntu8z4sco0cco0s44oogck8sc88ksgo08skokwcc48kg',
  apiClientSecret: '4krbgvyraayokk4wgoskwoswoc44088swkcs444c4wg4wc4ocs'
};

config.oauthRoot = `${config.apiProtocol}://${config.apiDomain}` + '/oauth/v2';
config.apiRoot   = `${config.apiProtocol}://${config.apiDomain}` + '/api/v1';

config.isDev = () => {return true};

config.defaultProductIconUri = 'https://storage.googleapis.com/imatrix-assets/images/products/icons/icon-default.svg';

export default config;
