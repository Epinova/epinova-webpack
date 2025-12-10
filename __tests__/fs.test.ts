import path from 'path';
import webpack, { Stats } from 'webpack';
import { fs, vol } from 'memfs';
import { test, expect, vi } from 'vitest';

import config from '../config';
import addTypeScript from '../typescript';

test('fs', async () => {
    Date.now = vi.fn(() => 1482363367071);
    fs.mkdirSync('/dist');

    const promise = new Promise<Stats | undefined>((resolve, reject) => {
        const c = config(
            {
                path: 'dist',
                publicPath: '/dist',
            },
            (config: webpack.Configuration) => {
                addTypeScript(config, {
                    configFile: path.resolve(
                        __dirname,
                        '../example/tsconfig.json'
                    ),
                });

                config.mode = 'production';

                config.output!.path = '/dist';

                config.entry = {
                    app: [
                        path.join(__dirname, '../example/app.js'),
                        path.join(__dirname, '../example/app.scss'),
                    ],
                };

                return config;
            }
        )({}, { mode: 'production', env: {} });

        const compiler = webpack(c);

        compiler.outputFileSystem =
            fs as unknown as webpack.Compiler['outputFileSystem'];
        compiler.intermediateFileSystem =
            fs as unknown as webpack.Compiler['intermediateFileSystem'];

        compiler.run((err, stats) => {
            if (err) reject(err);

            resolve(stats);
        });
    });

    const webpackStats = await promise;
    const json = vol.toJSON();
    if (!json) throw new Error('No JSON output from vol.toJSON()');
    expect(Object.keys(json)).toMatchSnapshot();
    expect(Object.values(json).map((v) => v?.length)).toMatchSnapshot();
    expect(webpackStats?.toJson('minimal')).toMatchSnapshot({
        version: expect.any(String),
    });
});
