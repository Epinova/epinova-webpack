# Migration guide to v1.6

-   [Without Storybook](#without-storybook)
-   [With Storybook - React](#with-storybook---react)

## Without Storybook

1. Remove all depedenencies from the project that is also a dependency for @epinova/webpack so you don't get any version conflicts. You can find the dependencies in the [package.json](package.json) file.
    - E.g. `npm remove css-loader postcss postcss-loader`
    - If you have any dependencies that is present in the "devDependencies" section in the package.json file above you still need those in your project as those are not added when you install this package.
1. In your terminal of choice, run the following commands in the directory where you have your package.json file in your project (eg. src/Site)
    - `npm install @epinova/webpack@latest webpack@latest webpack-cli@latest`
    - `npm install -D webpack-dev-server@latest`
1. If you have `webpack-bundle-analyzer` as a dependency in your project it should be updated
    - `npm i webpack-bundle-analyzer@latest`
1. If your project doesn't already have a dependency on `cross-env` you should install it
    - `npm i cross-env`
    - This is a dependency that allows us having a more consistent webpack experience across different platforms (Windows, Mac etc.)
1. If your project only consists of a single `webpack.config.js` file it should be renamed to `webpack.config.client.js`
    - Create a new `webpack.config.js` and add the following code
    ```
    module.exports = [
        require("./webpack.config.client"),
    ];
    ```
1. Replace or add the following scripts in `package.json`
    ```
    "scripts": {
        "build": "cross-env NODE_ENV=production webpack --mode production",
        "build:develop": "cross-env NODE_ENV=development webpack --mode development",
        "build:watch": "cross-env NODE_ENV=development webpack --mode development --watch",
        "develop": "cross-env NODE_ENV=development webpack serve --mode development --config webpack.config.client.js"
    }
    ```
1. Update the webpack.config.client.js file with the following code (if your project is an older one without a wwwroot folder remove that part from the `path.join()` code)
    ```
    config.devServer.static = {
        directory: path.join(__dirname, "wwwroot"),
        watch: false,
    }
    ```
1. Run "npm run build" and make sure you don't have any build issues
    - You might have a few warnings as a result of newer dependencies which are good to fix as soon as possible

## With Storybook - React

1. Make sure all Storybook addons/plugins are updated to work with Storybook 7
1. Follow the steps for upgrading a project without Storybook first
1. Remove all Storybook dependencies from your package.json file
1. Run `npm i -D storybook` in your terminal of choice
1. Run `npm i @storybook/addon-actions @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/preset-scss @storybook/react @storybook/react-webpack5 @storybook/testing-library` in the same terminal
1. Run `npm run build` in the same terminal and verify that your build is not broken
    - If it is broken and complains about alot of different loaders what you want to do is run `npm remove @epinova/webpack` and then `npm i @epinova/webpack@latest` to make npm install the dependencies correctly
    - Run `npm run build` again to verify it is no longer broken
1. Replace your Storybook scripts in package.json with the following ones
    ```json
    "scripts": {
        "storybook": "storybook dev -p 6006 -c Features/Storybook",
        "build-storybook": "storybook build -o wwwroot/storybook -c Features/Storybook",
    },
    ```
1. Rename the Storybook `main.js` to `main.ts` and replace the content with the following

    ```ts
    import { type StorybookConfig } from '@storybook/react-webpack5';

    const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

    const config: StorybookConfig = {
        stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
        addons: [
            '@storybook/addon-links',
            '@storybook/addon-essentials',
            '@storybook/addon-interactions',
            {
                name: '@storybook/preset-scss',
                options: {
                    cssLoaderOptions: {
                        url: {
                            filter: (url: string) => !url.startsWith('/'),
                        },
                    },
                },
            },
        ],
        framework: {
            name: '@storybook/react-webpack5',
            options: {},
        },
        docs: {
            autodocs: 'tag',
        },
        webpackFinal: (config) => {
            if (!config.resolve) config.resolve = {};
            if (!Array.isArray(config.resolve.plugins))
                config.resolve.plugins = [];

            config.resolve.plugins.push(
                new TsconfigPathsPlugin({
                    configFile: require('path').join(
                        __dirname,
                        '../../tsconfig.json'
                    ),
                })
            );

            return config;
        },
    };

    export default config;
    ```

1. Readd any plugins/presets that is missing from the configuration
1. Update or create a `.babelrc` file in the same folder as `package.json` and add/replace with the following
    ```json
    {
        "sourceType": "unambiguous",
        "presets": [
            [
                "@babel/preset-env",
                {
                    "targets": {
                        "chrome": 100
                    }
                }
            ],
            "@babel/preset-react",
            "@babel/preset-typescript"
        ],
        "plugins": []
    }
    ```
1. Run `npm run storybook` to verify that Storybook is starting and is working
