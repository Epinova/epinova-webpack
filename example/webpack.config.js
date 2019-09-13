const epinovaWebpackConfig = require('../config')

module.exports = epinovaWebpackConfig({}, config => {
    config.entry = './app.js'

    return config;
})
