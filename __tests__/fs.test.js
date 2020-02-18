/**
 * @jest-environment node
 */

const webpack = require("webpack");
const { createFsFromVolume, Volume } = require("memfs");
const joinPath = require("memory-fs/lib/join");
const path = require("path");
const serializer = require("jest-serializer-path");

const config = require("../config");

expect.addSnapshotSerializer(serializer);

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
test("fs", async () => {
    Date.now = jest.fn(() => 1482363367071);

    const vol = new Volume();
    const fs = new createFsFromVolume(vol);
    fs.mkdirSync("/dist");

    const promise = new Promise((resolve, reject) => {
        const c = config({ path: "dist", outputPath: "/dist" }, config => {
            config.entry = path.join(__dirname, "../example/app.js");

            config.optimization = {};

            config.plugins = [];

            return config;
        })("development", { mode: "development" });

        const compiler = buildWebpackCompiler(fs, c);
        return compiler.run((err, stats) => {
            if (err) {
                return reject(err);
            }

            resolve(stats);
        });
    });

    return promise.then(stats => {
        expect(
            stats.toJson({
                assets: true,
                hash: true,
                modules: false
            })
        ).toMatchSnapshot();
        expect(vol.toJSON()).toMatchSnapshot();
    });
});
