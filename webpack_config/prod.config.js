'use strict';

const path    = require('path');
const Merge   = require('webpack-merge');
const webpack = require('webpack');

let baseConfig = require('./base.config');
let defaultSettings = require('./defaults');

module.exports = Merge(baseConfig, baseConfig, {
    entry: path.join(__dirname, '../src/index'),
    cache: false,
    devtool: 'sourcemap',
    plugins: [
      //https://webpack.js.org/guides/production/ - this will only replace process.env.NODE_ENV with prod in sources
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"prod"'
        }),
        new webpack.LoaderOptionsPlugin({
          port: 8000
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    module: defaultSettings.getDefaultModules()
});
