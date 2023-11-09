// @ts-check
const fs = require('fs');

/**
 * @param {import('webpack-cli').WebpackConfiguration} config
 * @param {string} pfx
 * @param {string} passphrase
 */
function addCertificate(config, pfx, passphrase) {
    if (process.env.WEBPACK_SERVE !== 'true') return;

    if (!fs.existsSync(pfx)) {
        throw new Error(
            `@epinova/webpack - The certificate ${pfx} was not found, please see https://dev.azure.com/epinova/Epinova%20FoU/_git/epinova-webpack?anchor=certificate for documentation on how to export this certificate`
        );
    }

    if (!config.devServer) config.devServer = {};

    config.devServer.server = {
        type: 'https',
        options: {
            pfx,
            passphrase,
        },
    };
}

module.exports = addCertificate;
