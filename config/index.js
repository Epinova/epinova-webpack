const path = require('path');

const argv = require('yargs').argv
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const defaultOptions = {
    path: 'dist',
    https: false,
    outputPath: undefined,
    devServerContentBase: path.resolve(process.cwd() || process.env.PWD || __dirname),
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

        let publicPath = options.browserstackUrl + ':' + options.devServerPort + '/' + options.path + '/';

        if(! argv.browserstackUrl && options.https) {
            publicPath = publicPath.replace("http", "https");
        }

        return callback({
            stats: 'errors-warnings',
            devServer: {
                compress: true,
                disableHostCheck: true,
                headers: { 'Access-Control-Allow-Origin': '*' },
                https: options.https,
                host: options.devServerHost,
                port: options.devServerPort,
                contentBase: options.devServerContentBase,
                publicPath,
            },
            devtool: argv.mode === 'development' ? 'cheap-module-source-map' : false,
            resolve: {
                extensions: ['.wasm', '.mjs', '.js', '.json', '.vue', '.jsx']
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
                        test: /\.s(c|a)ss$/,
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
                                loader: 'sass-loader'
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
                        ? publicPath
                        : '/' + options.path + '/',
                path: options.outputPath,
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
