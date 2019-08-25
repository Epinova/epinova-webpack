# @epinova/webpack
Default Webpack configuration for Epinova Webpack projects

## Usage
`webpack.config.js`

```javascript
const epinovaWebpackConfig = require('@epinova/webpack');

const config = epinovaWebpackConfig({}, config => {
    config.entry = './Scripts/global/index.js';

    return config;
});

module.exports = config;
```

## Advanced

```javascript
const epinovaWebpackConfig = require('@epinova/webpack');

const config = epinovaWebpackConfig({
    path: 'public',
    devServerPort: 9000
}, (config, env, argv) => {
    config.entry = './Scripts/global/index.js';

    if(env === 'development') {
        ...
    }

    return config;
});

module.exports = config;
```

# Customization/Examples

## GlobbedEntriesPlugin
`npm i --save globbed-webpack-entries-plugin`

```javascript
const epinovaWebpackConfig = require('@epinova/webpack');
const GlobbedEntriesPlugin = require('globbed-webpack-entries-plugin');

const config = epinovaWebpackConfig({}, config => {
    config.entry = GlobbedEntriesPlugin.entries({
        global: [
            './Scripts/global/**/*.js',
            './Styles/global/**/*.scss'
        ]
    });

    config.plugins.push(new GlobbedEntriesPlugin());
});

module.exports = config;
```

## Vue
`npm i --save vue vue-loader vue-template-compiler`

```javascript
const epinovaWebpackConfig = require('@epinova/webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const config = epinovaWebpackConfig({}, config => {
    ...

    config.module.rules.push({
        test: /\.vue$/,
        loader: 'vue-loader'
    });

    config.plugins.push(new VueLoaderPlugin());

    ...
});

module.exports = config;
```
