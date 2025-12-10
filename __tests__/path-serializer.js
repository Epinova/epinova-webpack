// Path serializer for Vitest - replaces jest-serializer-path functionality
// Normalizes paths in snapshots to make them platform-independent

const path = require('path');
const os = require('os');
const fs = require('fs');

function getRealPath(pathname) {
    try {
        return fs.realpathSync(pathname);
    } catch (error) {
        return pathname;
    }
}

function slash(val) {
    return val.replace(/\\/g, '/');
}

function normalizePaths(value) {
    if (typeof value !== 'string') {
        return value;
    }

    const cwd = process.cwd();
    const cwdReal = getRealPath(cwd);
    const tempDir = os.tmpdir();
    const tempDirReal = getRealPath(tempDir);
    const homeDir = os.homedir();
    const homeDirReal = getRealPath(homeDir);

    const homeRelativeToTemp = path.relative(tempDir, homeDir);
    const homeRelativeToTempReal = path.relative(tempDirReal, homeDir);
    const homeRealRelativeToTempReal = path.relative(tempDirReal, homeDirReal);
    const homeRealRelativeToTemp = path.relative(tempDir, homeDirReal);

    const runner = [
        // Replace process.cwd with <PROJECT_ROOT>
        val => val.split(cwdReal).join('<PROJECT_ROOT>'),
        val => val.split(cwd).join('<PROJECT_ROOT>'),

        // Replace home directory with <TEMP_DIR>
        val => val.split(tempDirReal).join('<TEMP_DIR>'),
        val => val.split(tempDir).join('<TEMP_DIR>'),

        // Replace home directory with <HOME_DIR>
        val => val.split(homeDirReal).join('<HOME_DIR>'),
        val => val.split(homeDir).join('<HOME_DIR>'),

        // handle HOME_DIR nested inside TEMP_DIR
        val => val.split(`<TEMP_DIR>${path.sep + homeRelativeToTemp}`).join('<HOME_DIR>'),
        val => val.split(`<TEMP_DIR>${path.sep + homeRelativeToTempReal}`).join('<HOME_DIR>'),
        val => val.split(`<TEMP_DIR>${path.sep + homeRealRelativeToTempReal}`).join('<HOME_DIR>'),
        val => val.split(`<TEMP_DIR>${path.sep + homeRealRelativeToTemp}`).join('<HOME_DIR>'),

        // Remove win32 drive letters, C:\ -> \
        val => val.replace(/[a-zA-Z]:\\/g, '\\'),

        // Convert win32 backslash's to forward slashes, \ -> /
        val => slash(val),
    ];

    let result = value;
    runner.forEach(current => {
        result = current(result);
    });

    return result;
}

function shouldUpdate(value) {
    if (typeof value !== 'string') {
        return false;
    }
    return normalizePaths(value) !== value;
}

function normalizeValue(val) {
    if (val && typeof val === 'object') {
        const normalized = {};
        Object.keys(val).forEach(key => {
            normalized[key] = normalizeValue(val[key]);
        });
        return normalized;
    } else if (typeof val === 'string') {
        return normalizePaths(val);
    }
    return val;
}

module.exports = {
    serialize(val, config, indentation, depth, refs, printer) {
        return printer(normalizeValue(val), config, indentation, depth, refs);
    },
    test(val) {
        let has = false;
        if (val && typeof val === 'object') {
            Object.keys(val).forEach(key => {
                if (shouldUpdate(val[key])) {
                    has = true;
                }
            });
        } else if (shouldUpdate(val)) {
            has = true;
        }
        return has;
    },
    normalizePaths,
    getRealPath,
};
