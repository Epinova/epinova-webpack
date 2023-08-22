const path = require('path');

const {
    config: epinovaWebpackServerConfig,
    addVue,
} = require('@epinova/webpack/server');
const addTypeScript = require('@epinova/webpack/typescript');

module.exports = epinovaWebpackServerConfig(
    { path: 'ssr-vue' },
    (config, env, argv) => {
        config.name = 'Server Vue';

        config.entry = {
            server: './features/Vue/server.ts',
        };

        addTypeScript(config, {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
        });

        addVue(config);

        return config;
    }
);
