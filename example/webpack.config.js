const epinovaWebpackConfig = require('../config')

module.exports = epinovaWebpackConfig({}, config => {
    config.entry = {
        main: ['./app.js', './app.scss']
    }

    return config;
})
