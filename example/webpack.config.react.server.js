const path = require('path');

const {
    config: epinovaWebpackServerConfig,
} = require('@epinova/webpack/server');
const addTypeScript = require('@epinova/webpack/typescript');

module.exports = epinovaWebpackServerConfig(
    { path: 'ssr-react' },
    (config, env, argv) => {
        config.entry = {
            server: './Features/server/react.ts',
        };

        addTypeScript(config, {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
        });

        return config;
    }
);
