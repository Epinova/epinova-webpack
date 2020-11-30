const epinovaWebpackConfig = require('../config');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = epinovaWebpackConfig({}, (config) => {
    config.entry = {
        app: ['./app.js', './app.scss'],
    };

    config.plugins.push(new CleanWebpackPlugin());

    return config;
});
