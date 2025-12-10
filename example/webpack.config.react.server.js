const path = require('path');

const {
    config: epinovaWebpackServerConfig,
} = require('@epinova/webpack/server');
const addTypeScript = require('@epinova/webpack/typescript');

module.exports = epinovaWebpackServerConfig(
    { path: 'ssr-react' },
    (config, env, argv) => {
        config.name = 'Server React';

        config.entry = {
            server: './features/React/server.ts',
        };

        addTypeScript(config, {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
        });

        return config;
    }
);
