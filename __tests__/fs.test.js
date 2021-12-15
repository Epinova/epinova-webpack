/**
 * @jest-environment node
 */

require('jest');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');
const joinPath = require('memory-fs/lib/join');
const path = require('path');

const config = require('../config');
const addTypeScript = require('../typescript');

function ensureWebpackMemoryFs(fs) {
    // Return it back, when it has Webpack 'join' method
    if (fs.join) {
        return fs;
    }

    // Create FS proxy, adding `join` method to memfs, but not modifying original object
    const nextFs = Object.create(fs);
    nextFs.join = joinPath;

    return nextFs;
}

// Usage with Webpack:

function buildWebpackCompiler(fs, webpackConfig) {
    const webpackFs = ensureWebpackMemoryFs(fs);

    const compiler = webpack(webpackConfig);

    compiler.outputFileSystem = webpackFs;
    compiler.resolvers.context.fileSystem = webpackFs;

    return compiler;
}

test('fs', () => {
    jest.setTimeout(10000);

    expect.assertions(2);

    Date.now = jest.fn(() => 1482363367071);

    const vol = new Volume();
    const fs = new createFsFromVolume(vol);
    fs.mkdirSync('/dist');

    const promise = new Promise((resolve, reject) => {
        const c = config(
            {
                path: 'dist',
                outputPath: '/dist',
                tsConfigPath: './example/tsconfig.json',
            },
            (config) => {
                addTypeScript(config, {
                    configFile: path.resolve(
                        __dirname,
                        '../example/tsconfig.json'
                    ),
                });

                config.mode = 'production';

                config.output.path = '/dist';

                config.entry = {
                    main: [
                        path.join(__dirname, '../example/app.js'),
                        path.join(__dirname, '../example/app.scss'),
                    ],
                };

                return config;
            }
        )('production', { mode: 'production' });

        buildWebpackCompiler(fs, c).run((err, stats) => {
            if (err) reject(err);

            resolve(stats);
        });
    });

    return promise.then((stats) => {
        const json = vol.toJSON();

        // No need to compare jpg content, just check that it is present
        for (key in json) {
            if (key.endsWith('.jpg')) json[key] = key;
        }

        expect(json).toMatchSnapshot();
        expect(stats.toJson('minimal')).toMatchSnapshot();
    });
});
