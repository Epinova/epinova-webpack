const serializer = require('jest-serializer-path');

const config = require('../config');

expect.addSnapshotSerializer(serializer);

test('errors', () => {
    expect(() => config(undefined)).toThrowError();
    expect(() => config('dist', {})).toThrowError();
});

test('configuration', () => {
    const path = 'wwwroot/dist';
    const publicPath = '/dist/';

    const env = 'test';
    const argv = {
        mode: 'development',
    };

    const c = config({ path, publicPath }, (config, configEnv, configArgv) => {
        config.entry = './Scripts/global/index.js';

        expect(configEnv).toEqual(env);
        expect(configArgv).toEqual(argv);

        return config;
    });

    const value = c(env, argv);

    expect(typeof c).toEqual('function');
    expect(typeof value).toEqual('object');
    expect(value.entry).toEqual('./Scripts/global/index.js');
    expect(value.devServer.publicPath).toContain(publicPath);
    expect(value.output.publicPath).toEqual(publicPath);
});

test('development', () => {
    expect(
        config({ path: 'dist' })('development', { mode: 'development' })
    ).toMatchSnapshot();
});

test('production', () => {
    expect(
        config({ path: 'dist' })('production', { mode: 'production' })
    ).toMatchSnapshot();
});
