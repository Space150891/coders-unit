'use strict';

const path    = require('path');
const Merge   = require('webpack-merge');
const webpack = require('webpack');

let baseConfig      = require('./base.config');
let defaultSettings = require('./defaults');

module.exports = Merge(baseConfig, {
    entry: [
        'webpack-dev-server/client?http://127.0.0.1:8000',
        'webpack/hot/only-dev-server',
        './src/index'
    ],
    cache: true,
    devtool: 'eval-source-map',
    plugins: [
        //https://webpack.js.org/guides/production/ - this will only replace process.env.NODE_ENV with dev in sources
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': '"dev"'
        }),
        //https://webpack.js.org/guides/migrating/
        new webpack.LoaderOptionsPlugin({
             debug: true
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    module: defaultSettings.getDefaultModules()
});
