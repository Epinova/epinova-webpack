const path = require('path');

const epinovaWebpackConfig = require('../config');
const addTypeScript = require('../typescript');
const dynamicBundles = require('../dynamic-bundles');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');

module.exports = epinovaWebpackConfig(
    { path: 'wwwroot/dist', publicPath: '/dist/' },
    (config) => {
        addTypeScript(config);

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

        dynamicBundles(config, [path.resolve(__dirname, 'features')]);

        config.plugins.push(
            new SVGSpritemapPlugin('UI/*.svg', {
                output: {
                    // Add generated hash to output filename
                    filename: `sprite.[contenthash].svg`,
                    chunk: {
                        name: 'sprite.svg',
                        keep: false,
                    },
                    svg4everybody: true,
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
