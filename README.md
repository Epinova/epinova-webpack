# epinova-webpack
Default Webpack configuration for Epinova Webpack projects

## Usage
`webpack.config.js`

    const epinovaConfig = require('epinova-webpack');
    const path = require('path');

    module.exports = (env, argv) => {
        const config = epinovaConfig(env, argv);

        config.entry = {
            global: './Scripts/global/index.js'
        };

        config.output.path = path.resolve(__dirname, 'dist');

        config.devServer.contentBase = path.join(__dirname);

        return config;
    };

## Customization/Examples

### GlobbedEntriesPlugin
`npm i --save globbed-webpack-entries-plugin`

    ...
    const GlobbedEntriesPlugin = require('globbed-webpack-entries-plugin');

    module.exports = (env, argv) => {
        ...

        config.entry = GlobbedEntriesPlugin.entries({
            global: [
                './Scripts/global/**/*.js',
                './Styles/global/**/*.scss'
            ]
        });

        config.plugins.push(new GlobbedEntriesPlugin());

        ...
    };


### Vue
`npm i --save vue vue-loader vue-template-compiler`

    ...
    const VueLoaderPlugin = require('vue-loader/lib/plugin')

    module.exports = (env, argv) => {
        ...

        config.module.rules.push({
            test: /\.vue$/,
            loader: 'vue-loader'
        })

        config.plugins.push(new VueLoaderPlugin());

        ...
    };
