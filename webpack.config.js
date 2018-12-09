const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default
const CriticalPlugin = require('html-webpack-critical-plugin');

const devMode = process.env.NODE_ENV !== 'production';
const viewsDir = 'src/views';

const viewPlugins = fs.readdirSync(viewsDir).map(filePath => {
    const fileName = filePath.split('.')[0];
    return [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, `${viewsDir}/${filePath}`),
            chunks: [`js/${fileName}`],
            filename: filePath,
        }),
        // new CriticalPlugin({
        //     base: path.resolve(__dirname, 'dist/'),
        //     src: filePath,
        //     dest: filePath,
        //     inline: true,
        //     minify: true,
        //     extract: true,
        //     width: 375,
        //     height: 565,
        //     penthouse: {
        //         blockJSRequests: false,
        //     }
        // }),
    ]
}).reduce((acc, plugins) => ([...acc, ...plugins]), []);

module.exports = {
    // Include source maps in development files
    devtool: devMode ? '#cheap-module-source-map' : false,

    context: path.join(__dirname, 'src'),

    plugins: [
        new CopyWebpackPlugin([{
            from: '../temp/webp',
            to: 'img',
        }, ]),
        new CopyWebpackPlugin([{
            from: './assets/icons',
            to: 'icons',
        }, ]),
        new CopyWebpackPlugin([{
            from: './manifest.json',
            to: 'manifest.json',
        }, ]),
        new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i }),
        new CopyWebpackPlugin([{
            from: './assets/css/styles.css',
            to: 'css/styles.css',
        }, ]),
        new CopyWebpackPlugin([{
            from: './assets/css/vendor.min.css',
            to: 'css/vendor.min.css',
        }, ]),
        ...viewPlugins,
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'defer'
          }),
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

    devServer: {
        staticOptions: {
            // // https://webpack.js.org/configuration/dev-server/#devserver-staticoptions
            setHeaders: function (res, path, stat) {
                console.log('I was called!!! too!!')
                res.set('Cache-Control', 'max-age=31536000')
            }
        }
    }
};
