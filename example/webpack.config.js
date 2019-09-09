const epinovaWebpackConfig = require('../config')

module.exports = epinovaWebpackConfig({}, config => {
    config.entry = './test.js'

    return config;
})
