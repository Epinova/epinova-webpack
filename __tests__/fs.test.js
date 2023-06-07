// @jest-environment node

const path = require('path');

require('jest');
const webpack = require('webpack');
const { fs, vol } = require('memfs');

const config = require('../config');
const addTypeScript = require('../typescript');

jest.setTimeout(10000);

test('fs', () => {
    expect.assertions(2);
    Date.now = jest.fn(() => 1482363367071);
    fs.mkdirSync('/dist');

    const promise = new Promise((resolve, reject) => {
        const c = config(
            {
                path: 'dist',
                outputPath: '/dist',
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
                    app: [
                        path.join(__dirname, '../example/app.js'),
                        path.join(__dirname, '../example/app.scss'),
                    ],
                };

                return config;
            }
        )('production', { mode: 'production' });

        const compiler = webpack(c);

        // compiler.inputFileSystem = fs;
        compiler.outputFileSystem = fs;
        compiler.intermediateFileSystem = fs;

        compiler.run((err, stats) => {
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
