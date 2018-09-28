'use strict';

let path = require('path');
let srcPath = path.join(__dirname, '/../src/');

module.exports = {
    devtool: 'eval',
    module: {
        loaders: [
            {
                //We don't need any of these during testing
                //Null loader allows us to omit all the files with the following extensions
                test: /\.(png|jpg|gif|woff|woff2|css|sass|scss|less|styl)$/,
                loader: 'null-loader'
            },
            {
                //And these need to be put through th
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                include: [].concat(
                    [
                        path.join(__dirname, '/../src'),
                        path.join(__dirname, '/../test')
                    ]
                )
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx' ],
        alias: {
            actions: srcPath + 'actions/',
            helpers: path.join(__dirname, '/../test/helpers'),
            components: srcPath + 'components/',
            sources: srcPath + 'sources/',
            stores: srcPath + 'stores/',
            styles: srcPath + 'styles/',
            config: srcPath + 'serverConfig/' + process.env.REACT_WEBPACK_ENV
        }
    }
};
