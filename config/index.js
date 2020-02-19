const path = require('path');

const argv = require('yargs').argv
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const defaultOptions = {
    path: 'dist',
    devServerContentBase: path.resolve(process.env.PWD),
    devServerHost: '0.0.0.0',
    devServerPort: 8080,
    browserstackUrl: argv.browserstack || 'http://127.0.0.1'
}

module.exports = function(userOptions, callback) {
    if(typeof userOptions !== 'object') {
        throw new Error('Parameter \'userOptions\' must be an object. Receieved: ' + typeof userOptions)
    }

    if(typeof callback !== 'function' && typeof callback !== 'undefined') {
        throw new Error('Parameter \'callback\' must be a function or undefined. Receieved: ' + typeof callback)
    }

    if(! callback) {
        callback = function(config) {
            return config
        }
    }

    const options = Object.assign({}, defaultOptions, userOptions);

    return function(env, argv) {
        const isDevServer = process.env.WEBPACK_DEV_SERVER

        return callback({
            devServer: {
                compress: true,
                disableHostCheck: true,
                headers: { 'Access-Control-Allow-Origin': '*' },
                host: options.devServerHost,
                port: options.devServerPort,
                contentBase: options.devServerContentBase,
                publicPath: options.browserstackUrl + ':' + options.devServerPort + '/' + options.path + '/'
            },
            devtool: argv.mode === 'development' ? 'cheap-module-source-map' : false,
            resolve: {
                extensions: ['.js', '.vue', '.json']
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        exclude: /node_modules/
                    },
                    {
                        test: /\.css$/,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    hmr: argv.mode === 'development',
                                    reloadAll: true
                                }
                            },
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 1,
                                    sourceMap: true,
                                    url: false
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true
                                }
                            }
                        ]
                    },
                    {
                        test: /\.scss$/,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: {
                                    hmr: argv.mode === 'development',
                                    reloadAll: true
                                }
                            },
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 2,
                                    sourceMap: true,
                                    url: false
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    fiber: require('fibers'),
                                    implementation: require('sass')
                                }
                            }
                        ]
                    }
                ]
            },
            optimization: {
                minimizer: [
                    new OptimizeCssAssetsPlugin({
                        cssProcessorOptions: {
                            discardComments: {
                                removeAll: true
                            }
                        }
                    }),
                    new TerserPlugin({
                        parallel: true,
                        terserOptions: {
                            output: {
                                comments: false
                            }
                        }
                    })
                ],
                splitChunks: {
                    chunks: 'initial'
                }
            },
            output: {
                hashDigestLength: 8,
                publicPath:
                    isDevServer
                        ? options.browserstackUrl + ':' + options.devServerPort + '/' + options.path + '/'
                        : '/' + options.path + '/',
                filename:
                argv.mode === 'development' ? '[name].js' : '[name].[contenthash].js'
            },
            plugins: [
                new ManifestPlugin({
                    writeToFileEmit: true
                }),
                new MiniCssExtractPlugin({
                    filename:
                    argv.mode === 'development'
                    ? '[name].css'
                    : '[name].[contenthash].css'
                })
            ]
        }, env, argv);
    }
};
