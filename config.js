const fs = require('fs');
const path = require('path');

const { argv } = require('yargs');
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
    https: false,
    outputPath: undefined,
    devServerContentBase: path.resolve(
        process.cwd() || process.env.PWD || __dirname
    ),
    devServerHost: '0.0.0.0',
    devServerPort: 8080,
    browserstackUrl: argv.browserstack || 'http://127.0.0.1',
    certificate: {
        path: path.join(
            path.resolve(process.cwd() || process.env.PWD),
            './webpack-dev-server.pfx'
        ),
        passphrase: 'webpack-dev-server',
        suppressCertificateWarning: false,
    },
};

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
        callback = function (config) {
            return config;
        };
    }

    const options = Object.assign({}, defaultOptions, userOptions);

    if (!options.certificate.suppressCertificateWarning) {
        if (!fs.existsSync(options.certificate.path)) {
            const text = `WARNING @epinova/webpack: The certificate ${options.certificate.path} was not found, please export a valid certficate by running "dotnet dev-certs https -ep ./webpack-dev-server.pfx -p ${options.certificate.passphrase} --trust"`;
            const message = chalk.black.bgYellow(text);
            console.warn(message);
        }
    }

    return function (env, argv) {
        const isDevServer = process.env.WEBPACK_SERVE;

        let publicPath =
            options.browserstackUrl +
            ':' +
            options.devServerPort +
            options.publicPath;

        if (!argv.browserstackUrl && options.https) {
            publicPath = publicPath.replace('http', 'https');
        }

        const https = {
            type: 'https',
            options: {
                pfx: options.certificate.path,
                passphrase: options.certificate.passphrase,
            },
        };

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
                server: options.https ? https : 'http',
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

        return callback(config, env, argv);
    };
};
