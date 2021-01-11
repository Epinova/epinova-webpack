"use strict";
/**
 * @license MIT
 * @name ChunksWebpackPlugin
 * @version 7.0.0
 * @author: Yoriiis aka Joris DANIEL <joris.daniel@gmail.com>
 * @description: ChunksWebpackPlugin create HTML files to serve your webpack bundles. It is very convenient with multiple entrypoints and it works without configuration.
 * {@link https://github.com/yoriiis/chunks-webpack-plugins}
 * @copyright 2020 Joris DANIEL
 **/
var webpack = require("webpack");
var fs = require("fs");
// webpack v4/v5 compatibility:
// https://github.com/webpack/webpack/issues/11425#issuecomment-686607633
var RawSource = (webpack.sources || require("webpack-sources")).RawSource;
var path = require("path");
module.exports = /** @class */ (function () {
    /**
     * Instanciate the constructor
     * @param {options}
     */
    function ChunksWebpackPlugin(options) {
        if (options === void 0) {
            options = {};
        }
        // Merge default options with user options
        this.options = Object.assign(
            {
                filename: "manifest.json",
            },
            options
        );
        this.manifest = { assets: {}, chunks: {} };
        this.isWebpack4 = false;
        this.isDevServer = process.env.WEBPACK_DEV_SERVER;
        this.addAssets = this.addAssets.bind(this);
    }
    /**
     * Apply function is automatically called by the Webpack main compiler
     *
     * @param {Object} compiler The Webpack compiler variable
     */
    ChunksWebpackPlugin.prototype.apply = function (compiler) {
        this.isWebpack4 = webpack.version.startsWith("4.");
        var compilerHook = this.isWebpack4 ? "emit" : "thisCompilation";
        compiler.hooks[compilerHook].tap(
            "ChunksWebpackPlugin",
            this.hookCallback.bind(this)
        );
    };
    /**
     * Hook expose by the Webpack compiler
     *
     * @param {Object} compilation The Webpack compilation variable
     */
    ChunksWebpackPlugin.prototype.hookCallback = function (compilation) {
        this.compilation = compilation;
        if (this.isWebpack4) {
            this.addAssets();
        } else {
            // PROCESS_ASSETS_STAGE_ADDITIONAL: Add additional assets to the compilation
            this.compilation.hooks.processAssets.tap(
                {
                    name: "ChunksWebpackPlugin",
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
                },
                this.addAssets
            );
        }
    };
    /**
     * Add assets
     * The hook is triggered by webpack
     */
    ChunksWebpackPlugin.prototype.addAssets = function () {
        var _this = this;
        this.publicPath = this.getPublicPath();
        this.outputPath = this.getOutputPath();
        this.entryNames = this.getEntryNames();
        this.entryNames
            .filter(function (entryName) {
                return _this.getFiles(entryName).length;
            })
            .map(function (entryName) {
                return _this.processEntry(entryName);
            });

        this.assetsByChunkName();
        this.createChunksManifestFile();
    };

    ChunksWebpackPlugin.prototype.assetsByChunkName = function () {
        const compilationFileToChunks = new Map();
        for (const chunk of this.compilation.chunks) {
            for (const file of chunk.files) {
                let array = compilationFileToChunks.get(file);
                if (array === undefined) {
                    array = [];
                    compilationFileToChunks.set(file, array);
                }
                array.push(chunk);
            }
        }

        for (const [file, chunks] of compilationFileToChunks) {
            for (const chunk of chunks) {
                const name = chunk.name;
                if (!name) continue;
                if (name.indexOf("vendors~") !== -1) continue;
                if (
                    Object.prototype.hasOwnProperty.call(
                        this.manifest.chunks,
                        name
                    )
                )
                    continue;

                if (
                    !Object.prototype.hasOwnProperty.call(
                        this.manifest.assets,
                        name
                    )
                ) {
                    this.manifest.assets[name] = [];
                }

                this.manifest.assets[name].push("" + this.publicPath + file);
            }
        }
    };

    /**
     * Process for each entry

     * @param {String} entryName Entrypoint name
     */
    ChunksWebpackPlugin.prototype.processEntry = function (entryName) {
        var files = this.getFiles(entryName);
        var chunks = this.sortsChunksByType(files);
        this.updateManifest({ entryName: entryName, chunks: chunks });
    };
    /**
     * Get the public path from Webpack configuation
     * and add slash at the end if necessary
     *
     * @return {String} The public path
     */
    ChunksWebpackPlugin.prototype.getPublicPath = function () {
        var publicPath = this.compilation.options.output.publicPath || "";
        if (typeof publicPath === "function") {
            publicPath = publicPath();
        }
        return (
            "" +
            publicPath +
            (this.isPublicPathNeedsEndingSlash(publicPath) ? "/" : "")
        );
    };
    /**
     * Get the output path from Webpack configuation
     * or from constructor options
     *
     * @return {String} The output path
     */
    ChunksWebpackPlugin.prototype.getOutputPath = function () {
        return this.compilation.options.output.path || "";
    };
    /**
     * Get entrypoint names from the compilation
     *
     * @return {Array} List of entrypoint names
     */
    ChunksWebpackPlugin.prototype.getEntryNames = function () {
        return Array.from(this.compilation.entrypoints.keys());
    };
    /**
     * Get files list by entrypoint name
     *
     * @param {String} entryName Entrypoint name
     *
     * @return {Array} List of entrypoint names
     */
    ChunksWebpackPlugin.prototype.getFiles = function (entryName) {
        return this.compilation.entrypoints.get(entryName).getFiles();
    };
    /**
     * Sorts all chunks by type (styles or scripts)
     *
     * @param {Array} files List of files by entrypoint name
     *
     * @returns {Object} All chunks sorted by extension type
     */
    ChunksWebpackPlugin.prototype.sortsChunksByType = function (files) {
        var _this = this;
        return {
            styles: files
                .filter(function (file) {
                    return _this.isValidExtensionByType(file, "css");
                })
                .map(function (file) {
                    return "" + _this.publicPath + file;
                }),
            scripts: files
                .filter(function (file) {
                    return _this.isValidExtensionByType(file, "js");
                })
                .map(function (file) {
                    return "" + _this.publicPath + file;
                }),
        };
    };
    /**
     * Check if the publicPath need an ending slash
     *
     * @param {String} publicPath Public path
     *
     * @returns {Boolean} The public path need an ending slash
     */
    ChunksWebpackPlugin.prototype.isPublicPathNeedsEndingSlash = function (
        publicPath
    ) {
        return !!(publicPath && publicPath.substr(-1) !== "/");
    };
    /**
     * Check if file extension correspond to the type parameter
     *
     * @param {String} file File path
     * @param {String} type File extension
     *
     * @returns {Boolean} File extension is valid
     */
    ChunksWebpackPlugin.prototype.isValidExtensionByType = function (
        file,
        type
    ) {
        return path.extname(file).substr(1) === type;
    };
    /**
     * Update the class property manifest
     * which contains all chunks informations by entrypoint
     *
     * @param {String} entryName Entrypoint name
     * @param {Object} chunks List of styles and scripts chunks by entrypoint
     */
    ChunksWebpackPlugin.prototype.updateManifest = function (_a) {
        var entryName = _a.entryName,
            chunks = _a.chunks;
        this.manifest.chunks[entryName] = {
            styles: chunks.styles,
            scripts: chunks.scripts,
        };
    };
    /**
     * Create the chunks manifest file
     * Contains all scripts and styles chunks grouped by entrypoint
     */
    ChunksWebpackPlugin.prototype.createChunksManifestFile = function () {
        // Stringify the content of the manifest
        var output = JSON.stringify(this.manifest, null, 2);
        var outputPath = this.getOutputPath();

        // Expose the manifest file into the assets compilation
        // The file is automatically created by the compiler
        this.compilation.emitAsset(
            this.options.filename,
            new RawSource(output, false)
        );

        if (this.isDevServer) {
            if (!fs.existsSync(outputPath))
                fs.mkdirSync(path.resolve(outputPath));

            fs.writeFileSync(
                path.join(this.getOutputPath(), this.options.filename),
                output
            );
        }
    };
    /**
     * Throw an error
     *
     * @param {String} message Text to display in the error
     */
    ChunksWebpackPlugin.prototype.setError = function (message) {
        throw new Error(message);
    };
    return ChunksWebpackPlugin;
})();
