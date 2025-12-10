const path = require('path');

const webpack = require('webpack');
const { fs, vol } = require('memfs');
const serializer = require('./path-serializer');

const config = require('../config');
const addTypeScript = require('../typescript');

expect.addSnapshotSerializer(serializer);

// Custom serializer to replace version numbers in snapshots
// This prevents snapshot failures when dependencies are updated
expect.addSnapshotSerializer({
    serialize(val, config, indentation, depth, refs, printer) {
        // Replace semver versions with placeholder
        const sanitized = val.replace(
            /\b\d+\.\d+\.\d+(-[\w.]+)?\b/g,
            '<VERSION>'
        );
        return printer(sanitized, config, indentation, depth, refs);
    },
    test: (val) =>
        typeof val === 'string' &&
        /\d+\.\d+\.\d+/.test(val) &&
        !val.includes('<VERSION>'),
});

test('fs', () => {
    expect.assertions(2);
    Date.now = vi.fn(() => 1482363367071);
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
        for (const key in json) {
            if (key.endsWith('.jpg')) json[key] = key;
        }

        expect(json).toMatchSnapshot();
        expect(stats.toJson('minimal')).toMatchSnapshot();
    });
});
