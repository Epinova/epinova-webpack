# epinova-webpack

Default Webpack configuration for Epinova Webpack projects

## Usage
`webpack.config.js`

    const epinovaConfig = require('epinova-webpack');

    module.exports = (env, argv) => {
        const config = epinovaConfig(env, argv);

        config.entry = {
            global: './Scripts/global/index.js'
        };

        return config;
    };

## Customization/Examples

### GlobbedEntriesPlugin
`webpack.config.js`

    const epinovaConfig = require('epinova-wepack');
    const GlobbedEntriesPlugin = require('globbed-webpack-entries-plugin');

    module.exports = (env, argv) => {
        const config = epinovaConfig(env, argv);

        config.entry = GlobbedEntriesPlugin.entries({
            global: [
                './Scripts/global/**/*.js',
                './Styles/global/**/*.scss'
            ]
        });

        config.module.rules.push({
            test: /\.ts$/,
            exclude: /node_modules/,
            loader: 'ts-loader',
            options: {
                onlyCompileBundledFiles: true,
            },
        });

        return config;
    };


### TypeScript
`webpack.config.js`

    const epinovaConfig = require('epinova-wepack');

    module.exports = (env, argv) => {
        const config = epinovaConfig(env, argv);

        config.entry = {
            global: './Scripts/global/index.js'
        };

        config.module.rules.push({
            test: /\.ts$/,
            exclude: /node_modules/,
            loader: 'ts-loader',
            options: {
                onlyCompileBundledFiles: true,
            },
        });

        return config;
    };
