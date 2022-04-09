const path = require('path');

const {
    config: epinovaWebpackServerConfig,
    addVue,
} = require('@epinova/webpack/server');
const addTypeScript = require('@epinova/webpack/typescript');

module.exports = epinovaWebpackServerConfig(
    { path: 'ssr-vue' },
    (config, env, argv) => {
        config.entry = {
            server: './Features/server/vue.ts',
        };

        addTypeScript(config, {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
        });

        addVue(config);

        return config;
    }
);
