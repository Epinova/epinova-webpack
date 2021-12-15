const path = require('path');

const { fdir } = require('fdir');

const epinovaWebpackDynamicBundles = (config, directories) => {
    if (!config) throw Error('Missing config argument');
    if (!directories || !Array.isArray(directories))
        throw Error('Missing directories argument or argument is not an array');

    if (!config.entry) {
        config.entry = {};
    }

    const bundles = [];

    directories.forEach((d) => {
        bundles.push(
            ...new fdir()
                .glob('./**/*.bundle.json')
                .withBasePath()
                .crawl(d)
                .sync()
        );
    });

    bundles.forEach((bundle) => {
        const json = require(bundle);
        const filename = path.basename(bundle);
        const entry = filename.replace('.bundle.json', '');

        const entries = [];
        if (json.scripts && json.scripts.length) entries.push(...json.scripts);
        if (json.styles && json.styles.length) entries.push(...json.styles);

        if (entries.length) {
            config.entry[entry] = entries.map((file) =>
                path.resolve(path.dirname(bundle), file)
            );
        }
    });
};

module.exports = epinovaWebpackDynamicBundles;
