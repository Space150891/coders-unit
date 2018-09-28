'use strict';

const path = require('path');

/**
 * Build the webpack configuration
 * @param  {String} passedVars The wanted environment
 * @return {Object} Webpack serverConfig
 */
function buildConfig(passedVars) {

  process.env.REACT_WEBPACK_ENV = passedVars.env   || 'dev';
  process.env.THEME             = passedVars.theme || 'default';

  return require(path.join(__dirname, 'webpack_config/' + process.env.REACT_WEBPACK_ENV + '.config'));
}

module.exports = buildConfig;
