/**
 * Function that returns default values.
 * Used because Object.assign does a shallow instead of a deep copy.
 * Using [].push will add to the base array, so a require will alter
 * the base array output.
 */
'use strict';

const path             = require('path');
const srcPath          = path.join(__dirname, '/../src');
const defaultThemePath = path.join(__dirname, '/../themes/default');
const themeRelPath     = '../themes/' + process.env.THEME;
const themePath        = path.join(__dirname, '/' + themeRelPath);

/**
 * Get the default modules object for webpack
 * @return {Object}
 */
function getDefaultModules() {
    return {
        rules: [
            {
              test: /\.jsx?$/, // both .js and .jsx
              loader: 'eslint-loader',
              include: srcPath,
              enforce: 'pre',
              options: {
                failOnError:   false,
                failOnWarning: false,
              },
            },
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader'],
            },

            //https://github.com/webpack-contrib/less-loader
            //modifyVars option is used to populate current theme path in .less files
            //that is used to include the proper variables.less from a theme
            {
              test: /\.less/,
              use: ['style-loader', 'css-loader', {
                loader: 'less-loader',
                options: {
                  modifyVars: {
                    'THEME-PATH': '"../' + themeRelPath + '"',
                  }
                }
              }],
              include: [
                path.join(__dirname, '/../src/styles/'),
                path.join(__dirname, themeRelPath + '/styles/'),
              ]
            },
            {
              test: /\.(png|jpg|jpeg|svg)$/,
              use: [
                  {
                    loader: 'file-loader'
                  }
              ],
              include: [
                path.join(__dirname, '/../src/resources/images/'),
                path.join(__dirname, '/' + themeRelPath  + '/images/'),
                //Allow leaflet icons to be loaded as images
                path.join(__dirname, '/../node_modules/leaflet/dist/images/'),
                path.join(__dirname, '/../node_modules/leaflet-draw/dist/images/')
              ]
            },
            {
              test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
              use: ['file-loader?name=fonts/[name].[ext]'],
              include: [
                path.join(__dirname, '/../src/styles/fonts/'),
                path.join(__dirname, '/' + themeRelPath  + '/styles/fonts/'),
                path.join(__dirname, '/../node_modules/bootstrap/dist/fonts/')
              ]
            },
            {
              test: /\.coffee$/,
              use: ["coffee-loader"]
            },
            {
              test: /\.(js|jsx)$/,
              use: ['babel-loader'],
              include: [].concat(
                [ path.join(__dirname, '/../src') ]
              )
            },
            {
              test: /\.txt$/,
              use: 'raw-loader'
            }
        ]
    };
}

module.exports = {
    defaultThemePath:  defaultThemePath,
    themePath:         themePath,
    srcPath:           srcPath,
    publicPath:        '/assets/',
    getDefaultModules: getDefaultModules
};
