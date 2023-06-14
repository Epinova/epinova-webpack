const path = require('path');

const epinovaWebpackConfig = require('@epinova/webpack');
const addTypeScript = require('@epinova/webpack/typescript');
const dynamicBundles = require('@epinova/webpack/dynamic-bundles');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = epinovaWebpackConfig(
    { path: 'wwwroot/dist', publicPath: '/dist/' },
    (config) => {
        config.name = 'Client';

        config.entry = {
            main: ['./app.js', './app.scss'],
            'application-a': ['./a.js', './a.scss'],
            'application-b': ['./b.js', './b.scss'],
            'application-c': ['./c.js', './a.scss', './b.scss'],
            'application-d': ['./d.js'],
            'application-e': ['./e.js'],
            'application-f': ['./f.js'],
            'application-g': ['./g.js'],
            'application-h': ['./h.js'],
            'application-i': ['./i.js'],
            'application-j': ['./j.js'],
        };

        addTypeScript(config);

        dynamicBundles(config, [path.resolve(__dirname, 'features')]);

        // Vue
        config.module.rules.push({
            test: /\.vue$/,
            use: 'vue-loader',
        });
        config.plugins.push(new VueLoaderPlugin());

        config.plugins.push(
            new SVGSpritemapPlugin('UI/*.svg', {
                output: {
                    // Add generated hash to output filename
                    filename: `sprite.[contenthash].svg`,
                    chunk: {
                        name: 'sprite.svg',
                        keep: false,
                    },
                },
                sprite: {
                    prefix: false,
                },
                styles: false,
            })
        );

        return config;
    }
);
