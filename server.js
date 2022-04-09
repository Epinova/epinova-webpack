const path = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    addVue: function (config, dir = process.cwd()) {
        const VueLoaderPlugin = require(path.resolve(
            dir,
            'node_modules',
            'vue-loader/lib/plugin'
        ));
        const CopyWebpackPlugin = require(path.resolve(
            dir,
            'node_modules',
            'copy-webpack-plugin'
        ));

        config.module.rules.push({
            test: /\.vue$/,
            loader: 'vue-loader',
        });

        config.plugins.push(
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
            })
        );

        return config;
    },
    config: function (config, callback) {
        const dir = config.dir || process.cwd();
        const outputPath = config.path || 'ssr';

        return function (env, argv) {
            const config = {
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
                            test: /\.jsx?$/,
                            exclude: /node_modules/,
                            loader: 'babel-loader',
                        },
                        {
                            test: /\.(css|scss|less)$/,
                            loader: 'null-loader',
                        },
                    ],
                },
                output: {
                    path: path.resolve(dir, outputPath),
                    publicPath: '/',
                    filename: '[name].js',
                },
                plugins: [
                    new CleanWebpackPlugin(),
                    new webpack.DefinePlugin({
                        __CLIENT__: false,
                        __STORYBOOK__: false,
                    }),
                ],
            };

            return callback(config);
        };
    },
};
