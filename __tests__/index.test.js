const serializer = require('./path-serializer');

const config = require('../config');

expect.addSnapshotSerializer(serializer);

// Custom serializer to replace version numbers in snapshots
// This prevents snapshot failures when dependencies are updated
expect.addSnapshotSerializer({
    test: (val) =>
        typeof val === 'string' &&
        /\d+\.\d+\.\d+/.test(val) &&
        !val.includes('<VERSION>'),
    print: (val) => {
        // Replace semver versions with placeholder
        const sanitized = val.replace(
            /\b\d+\.\d+\.\d+(-[\w.]+)?\b/g,
            '<VERSION>'
        );
        return `"${sanitized}"`;
    },
});

test('errors', () => {
    expect(() => config(undefined)).toThrowError();
    expect(() => config('dist', {})).toThrowError();
});

test('no duplicate dependencies in example', () => {
    const packageJson = require('../package.json');
    const examplePackage = require('../example/package.json');

    const deps = Object.keys({
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
    });

    const exampleDeps = Object.keys({
        ...examplePackage.dependencies,
        ...examplePackage.devDependencies,
    });

    for (const dep of deps) {
        expect(exampleDeps).not.toContain(dep);
    }
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
