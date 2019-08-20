const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function(env, argv) {
    return {
        devServer: {
            compress: true,
            disableHostCheck: true,
            headers: { 'Access-Control-Allow-Origin': '*' },
            host: '0.0.0.0',
            port: 8080,
            publicPath: 'http://bs-local.com:8080/dist/'
        },
        devtool: argv.mode === 'development' ? 'cheap-module-source-map' : false,
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
                                sourceMap: true
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
                                sourceMap: true
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
                argv.mode === 'development'
                    ? 'http://bs-local.com:8080/dist/'
                    : '/dist/',
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
    };
};
