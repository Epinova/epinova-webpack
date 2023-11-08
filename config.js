// @ts-check
/**
 * @typedef {import('webpack').Configuration} Configuration
 * @typedef {{mode?: 'development' | 'production' | 'none', env: Environment }} Arguments
 * @typedef {Record<string, string | undefined>} Environment
 */

const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const chalk = require('chalk');

const ChunksWebpackPlugin = require('./manifest-plugin');

const defaultOptions = {
    path: 'dist',
    publicPath: '/dist/',
    https: true,
    devServerContentBase: path.resolve(
        process.cwd() || process.env.PWD || __dirname
    ),
    devServerHost: '0.0.0.0',
    devServerPort: 8080,
    suppressCertificateWarning: false,
};

/**
 * @param {Partial<typeof defaultOptions>} userOptions
 * @param {(config: Configuration, env: Environment, argv: Arguments) => Configuration} callback
 * @returns {(env: Environment, argv: Arguments) => Configuration}
 */
module.exports = function (userOptions, callback) {
    if (typeof userOptions !== 'object') {
        throw new Error(
            "Parameter 'userOptions' must be an object. Receieved: " +
                typeof userOptions
        );
    }

    if (typeof callback !== 'function' && typeof callback !== 'undefined') {
        throw new Error(
            "Parameter 'callback' must be a function or undefined. Receieved: " +
                typeof callback
        );
    }

    if (!callback) {
        /** @param {Configuration} config */
        callback = function (config) {
            return config;
        };
    }

    const options = Object.assign({}, defaultOptions, userOptions);

    return function (env, argv) {
        const isDevServer = !!env.WEBPACK_SERVE;

        let publicPath =
            'http://localhost' +
            ':' +
            options.devServerPort +
            options.publicPath;

        // https://www.browserstack.com/question/39574
        if (env.BROWSERSTACK) {
            publicPath = publicPath.replace('localhost', 'bs-local');
        }

        if (options.https) {
            publicPath = publicPath.replace('http', 'https');
        }

        /** @type {Configuration} */
        const config = {
            stats: 'errors-warnings',
            devServer: {
                compress: true,
                devMiddleware: {
                    publicPath,
                    writeToDisk: (filePath) => {
                        return /manifest\.json$/.test(filePath);
                    },
                },
                headers: { 'Access-Control-Allow-Origin': '*' },
                server: options.https ? 'https' : 'http',
                host: options.devServerHost,
                port: options.devServerPort,
            },
            devtool:
                argv.mode === 'development' ? 'cheap-module-source-map' : false,
            resolve: {
                extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx'],
                plugins: [],
            },
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        loader: 'babel-loader',
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.css$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 1,
                                    sourceMap: true,
                                    url: false,
                                },
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true,
                                },
                            },
                        ],
                    },
                    {
                        test: /\.s(c|a)ss$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 2,
                                    sourceMap: true,
                                    url: {
                                        filter: (url) => !url.startsWith('/'),
                                    },
                                },
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    implementation: require('sass'),
                                    sassOptions: {
                                        fiber: false,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        test: /\.(svg|png|jpg|gif)$/i,
                        type: 'asset',
                    },
                ],
            },
            optimization: {
                minimizer: [
                    new CssMinimizerPlugin(),
                    new TerserPlugin({
                        parallel: true,
                        terserOptions: {
                            output: {
                                comments: false,
                            },
                        },
                    }),
                ],
                splitChunks: {
                    chunks: 'all',
                },
                runtimeChunk: 'single',
            },
            output: {
                hashDigestLength: 8,
                publicPath: isDevServer ? publicPath : options.publicPath,
                path: path.resolve(process.cwd(), options.path),
                filename:
                    argv.mode === 'development'
                        ? '[name].js'
                        : '[name].[contenthash].js',
                assetModuleFilename: 'assets/[hash][ext][query]',
            },
            plugins: [
                new MiniCssExtractPlugin({
                    filename:
                        argv.mode === 'development'
                            ? '[name].css'
                            : '[name].[contenthash].css',
                }),
                new ChunksWebpackPlugin({
                    generateChunksManifest: true,
                    generateChunksFiles: false,
                }),
                new CleanWebpackPlugin(),
                new RemoveEmptyScriptsPlugin({ verbose: true }),
            ],
        };

        const final = callback(config, env, argv);

        if (isDevServer && !options.suppressCertificateWarning) {
            if (final.devServer && final.devServer.server === 'https') {
                const message = chalk.black.bgRed(
                    `@epinova/webpack - Using a fallback certificate that will likely cause issues. Please reference https://dev.azure.com/epinova/Epinova%20FoU/_git/epinova-webpack?anchor=certificate for a solution`
                );
                console.warn(message);
            }
        }

        return final;
    };
};
