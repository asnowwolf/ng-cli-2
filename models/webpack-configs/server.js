"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_project_module_1 = require("../../utilities/require-project-module");
/**
 * Returns a partial specific to creating a bundle for node
 * @param wco Options which are include the build options and app config
 */
function getServerConfig(wco) {
    const projectTs = require_project_module_1.requireProjectModule(wco.projectRoot, 'typescript');
    const supportES2015 = wco.tsConfig.options.target !== projectTs.ScriptTarget.ES3
        && wco.tsConfig.options.target !== projectTs.ScriptTarget.ES5;
    const config = {
        resolve: {
            mainFields: [
                ...(supportES2015 ? ['es2015'] : []),
                'main', 'module',
            ],
        },
        target: 'node',
        output: {
            libraryTarget: 'commonjs'
        },
        node: false,
    };
    if (wco.buildOptions.bundleDependencies == 'none') {
        config.externals = [
            /^@angular/,
            (_, request, callback) => {
                // Absolute & Relative paths are not externals
                if (request.match(/^\.{0,2}\//)) {
                    return callback();
                }
                try {
                    // Attempt to resolve the module via Node
                    const e = require.resolve(request);
                    if (/node_modules/.test(e)) {
                        // It's a node_module
                        callback(null, request);
                    }
                    else {
                        // It's a system thing (.ie util, fs...)
                        callback();
                    }
                }
                catch (e) {
                    // Node couldn't find it, so it must be user-aliased
                    callback();
                }
            }
        ];
    }
    return config;
}
exports.getServerConfig = getServerConfig;
//# sourceMappingURL=/users/twer/private/gde/angular-cli/models/webpack-configs/server.js.map