# Migration guide to v1.6

-   [Without Storybook](#without-storybook)
-   [With Storybook](#with-storybook)

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

## With Storybook

Work in progress
