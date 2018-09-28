'use strict';
require('core-js/fn/object/assign');
const webpack          = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const buildConfig      = require('./webpack.config');
const open     = require('open');
const argv     = require('yargs').argv;
const config   = buildConfig(argv);
const port = 8000;

new WebpackDevServer(webpack(config), config.devServer)
.listen(port, 'localhost', (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:' + port);
  console.log('Opening your system browser...');
  open('http://localhost:' + port);
});
