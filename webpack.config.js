const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default

const devMode = process.env.NODE_ENV !== 'production';
const viewsDir = 'src/views';

const viewPlugins = fs.readdirSync(viewsDir).map(file => {
    const fileName = file.split('.')[0];
    return new HtmlWebpackPlugin({
        template: path.resolve(__dirname, `${viewsDir}/${file}`),
        chunks: [`js/${fileName}`],
        filename: file,
    })
});

module.exports = {
    // Include source maps in development files
    devtool: devMode ? '#cheap-module-source-map' : false,

    context: path.join(__dirname, 'src'),

    plugins: [
        new CopyWebpackPlugin([{
            from: '../temp/img',
            to: 'img',
        }, ]),
        new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i }),
        new CopyWebpackPlugin([{
            from: './assets/css/styles.css',
            to: 'css/styles.css',
        }, ]),
        new CopyWebpackPlugin([{
            from: './data',
            to: './data',
        }, ]),
        ...viewPlugins,
        new Visualizer(),
    ],

    entry: {
        'js/index': [
            'babel-polyfill',
            '../node_modules/leaflet/dist/leaflet.js',
            './index.js',
        ],
        'js/restaurant': [
            'babel-polyfill',
            '../node_modules/leaflet/dist/leaflet.js',
            './restaurant.js',
        ],
        sw: './sw.js',
    },

    resolve: {
        extensions: ['*', '.js', ],
        modules: [
            path.resolve(__dirname, 'node_modules'),
        ],
    },

    output: {
        filename: '[name].js',
        chunkFilename: '[id].[hash]',
        path: path.resolve(__dirname, 'dist'),
        globalObject: 'this',
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
                'babel-loader',
            ],
        },
        {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            query: {
                limit: 10000,
                name: 'images/[name].[ext]',
            },
        },],
    },
};
