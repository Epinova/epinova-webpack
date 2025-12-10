import { test, expect } from 'vitest';
import type { SnapshotSerializer } from 'vitest';
import type { Configuration } from 'webpack';
import type { Argv } from 'webpack-cli';

import config from '../config';
import path from 'path';

// Extended Env type matching config.js - allows custom env properties
type Env = Argv['env'] & Record<string, string | boolean | undefined>;

// Custom serializer to replace version numbers in snapshots
// This prevents snapshot failures when dependencies are updated
expect.addSnapshotSerializer({
    test: (val): val is string =>
        typeof val === 'string' &&
        /\d+\.\d+\.\d+/.test(val) &&
        !val.includes('<VERSION>'),
    print: (val) => {
        // Replace semver versions with placeholder
        const sanitized = (val as string).replace(
            /\b\d+\.\d+\.\d+(-[\w.]+)?\b/g,
            '<VERSION>'
        );
        return `"${sanitized}"`;
    },
});

test('errors', () => {
    // @ts-expect-error - testing invalid input
    expect(() => config(undefined)).toThrowError();
    // @ts-expect-error - testing invalid input
    expect(() => config('dist', {})).toThrowError();
});

test('no duplicate dependencies in example', async () => {
    const packageJson = await import('../package.json');
    const examplePackage = await import('../example/package.json');

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

    const env: Env = { WEBPACK_BUILD: true };
    const argv: Argv = {
        mode: 'development',
        env,
    };

    const c = config(
        { path, publicPath },
        (config: Configuration, configEnv, configArgv) => {
            config.entry = './Scripts/global/index.js';

            expect(configEnv).toEqual(env);
            expect(configArgv).toEqual(argv);

            return config;
        }
    );

    const value = c(env, argv);

    expect(typeof c).toEqual('function');
    expect(typeof value).toEqual('object');
    expect(value.entry).toEqual('./Scripts/global/index.js');
    expect(value.output?.publicPath).toEqual(publicPath);
});

test('development', () => {
    const env: Env = {};
    expect(
        config({ path: 'dist' }, (c) => c)(env, { mode: 'development', env })
    ).toMatchSnapshot();
});

test('production', () => {
    const env: Env = {};
    expect(
        config({ path: 'dist' }, (c) => c)(env, { mode: 'production', env })
    ).toMatchSnapshot();
});
