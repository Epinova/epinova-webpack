const path = require('path');

const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (dir, callback) {
    return function (env, argv) {
        return callback({
            name: 'Server',
            stats: 'errors-warnings',
            devtool: false,
            watchOptions: {
                ignored: [
                    path.posix.resolve(dir, './ssr'),
                    path.posix.resolve(dir, './dist'),
                    path.posix.resolve(dir, './wwwroot/dist'),
                ],
            },
            resolve: {
                extensions: ['.js'],
                plugins: [],
            },
            target: 'web',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        loader: 'babel-loader',
                    },
                    {
                        test: /\.vue$/,
                        loader: 'vue-loader',
                    },
                    {
                        test: /\.(css|scss|less)$/,
                        loader: 'null-loader',
                    },
                ],
            },
            output: {
                path: path.resolve(dir, 'ssr'),
                publicPath: '/',
                filename: '[name].js',
            },
            plugins: [
                new CleanWebpackPlugin(),
                new VueLoaderPlugin(),
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: path.join(
                                dir,
                                'node_modules/vue/dist/vue.min.js'
                            ),
                            to: 'vue.js',
                        },
                        {
                            from: path.join(
                                dir,
                                'node_modules/vue-server-renderer/basic.js'
                            ),
                            to: 'vue-server-renderer.js',
                        },
                    ],
                }),
                new webpack.DefinePlugin({
                    __CLIENT__: false,
                    __STORYBOOK__: false,
                }),
            ],
        });
    };
};
