// @ts-check
/**
 * @typedef {import('webpack').Configuration} Configuration
 * @typedef {{mode?: 'development' | 'production' | 'none', env: Environment }} Arguments
 * @typedef {Record<string, string | undefined>} Environment
 */

const path = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    /**
     * @param {Configuration} config
     * @param {string} dir
     */
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

        if (!config.module) config.module = {};
        if (!Array.isArray(config.module.rules)) config.module.rules = [];

        config.module.rules.push({
            test: /\.vue$/,
            loader: 'vue-loader',
        });

        if (!Array.isArray(config.plugins)) config.plugins = [];

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
    /**
     * @param {{ dir: string, path: string }} config
     * @param {(config: Configuration) => Configuration} callback
     */
    config: function (config, callback) {
        const dir = config.dir || process.cwd();
        const outputPath = config.path || 'ssr';

        /**
         * @param {Environment} env
         * @param {Arguments} argv
         */
        return function (env, argv) {
            /** @type {Configuration} */
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
