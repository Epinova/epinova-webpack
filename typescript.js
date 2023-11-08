// @ts-check
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

/**
 * @param { import('webpack').Configuration } config
 * @param { { configFile?: string } } options
 */
function addTypeScript(config, options = { configFile: undefined }) {
    if (!config.resolve) config.resolve = {};
    if (!Array.isArray(config.resolve.extensions))
        config.resolve.extensions = [];

    config.resolve.extensions.push('.ts');
    config.resolve.extensions.push('.tsx');

    if (options.configFile) {
        if (!config.resolve.plugins) config.resolve.plugins = [];

        config.resolve.plugins.push(
            new TsconfigPathsPlugin({
                configFile: options.configFile,
            })
        );
    }

    if (!config.module) config.module = {};
    if (!Array.isArray(config.module.rules)) config.module.rules = [];

    config.module.rules.push({
        test: /.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
            transpileOnly: true,
            onlyCompileBundledFiles: true,
        },
    });

    if (!Array.isArray(config.plugins)) config.plugins = [];

    config.plugins.push(
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: options.configFile,
            },
        })
    );
}

module.exports = addTypeScript;
