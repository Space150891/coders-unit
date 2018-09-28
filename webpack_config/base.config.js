'use strict';
const path = require('path');
const defaultSettings = require('./defaults');

//https://webpack.github.io/docs/webpack-dev-server.html
module.exports = {
    devtool: 'eval',
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: 'app.js',
        publicPath: `${defaultSettings.publicPath}`
    },
    devServer: {
        contentBase: './src/',
        historyApiFallback: true,
        hot: true,
        port: 8000,
        publicPath: defaultSettings.publicPath,
        noInfo: false,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        }
    },
    resolve: {
        extensions: ['.js', '.jsx', '.coffee', '.less'],
        alias: {
            data_managers:       `${defaultSettings.srcPath}/data_managers/`,
            vendors:             `${defaultSettings.srcPath}/vendors/`,
            actions:             `${defaultSettings.srcPath}/actions/`,
            components:          `${defaultSettings.srcPath}/components/`,
            entities:            `${defaultSettings.srcPath}/entities/`,
            sources:             `${defaultSettings.srcPath}/sources/`,
            stores:              `${defaultSettings.srcPath}/stores/`,
            styles:              `${defaultSettings.srcPath}/styles/`,
            resources:           `${defaultSettings.srcPath}/resources/`,
            utils:               `${defaultSettings.srcPath}/utils/`,
            constants:           `${defaultSettings.srcPath}/constants/`,
            config$:             `${defaultSettings.srcPath}/config/${process.env.REACT_WEBPACK_ENV}.config.js`,
            dispatcher$:         `${defaultSettings.srcPath}/dispatcher/AppDispatcher.js`,
            //Specific theme vars file will load this and merge with it. this is how we make sure all the properties are in place
            default_theme_vars$: `${defaultSettings.defaultThemePath}/variables.js`,
            theme_vars$:         `${defaultSettings.themePath}/variables.js`,
        }
    },
    module: {},
};
