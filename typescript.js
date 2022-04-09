const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

/**
 * @param { any } config
 * @param { { configFile?: string } } options
 */
function addTypeScript(
    config,
    options = { vue: false, configFile: undefined }
) {
    config.resolve.extensions.push('.ts');
    config.resolve.extensions.push('.tsx');

    if (options.configFile) {
        config.resolve.plugins.push(
            new TsconfigPathsPlugin({
                configFile: options.configFile,
            })
        );
    }

    config.module.rules.push({
        test: /.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
            transpileOnly: true,
            onlyCompileBundledFiles: true,
        },
    });

    config.plugins.push(
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: options.configFile,
                extensions: options.vue ? { vue: true } : undefined,
            },
        })
    );
}

module.exports = addTypeScript;
