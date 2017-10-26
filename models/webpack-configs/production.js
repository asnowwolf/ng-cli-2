"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const webpack = require("webpack");
const fs = require("fs");
const semver = require("semver");
const common_tags_1 = require("common-tags");
const license_webpack_plugin_1 = require("license-webpack-plugin");
const build_optimizer_1 = require("@angular-devkit/build-optimizer");
const static_asset_1 = require("../../plugins/static-asset");
const glob_copy_webpack_plugin_1 = require("../../plugins/glob-copy-webpack-plugin");
const read_tsconfig_1 = require("../../utilities/read-tsconfig");
const require_project_module_1 = require("../../utilities/require-project-module");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
/**
 * license-webpack-plugin has a peer dependency on webpack-sources, list it in a comment to
 * let the dependency validator know it is used.
 *
 * require('webpack-sources')
 */
function getProdConfig(wco) {
    const { projectRoot, buildOptions, appConfig } = wco;
    const projectTs = require_project_module_1.requireProjectModule(projectRoot, 'typescript');
    let extraPlugins = [];
    let entryPoints = {};
    if (appConfig.serviceWorker) {
        const nodeModules = path.resolve(projectRoot, 'node_modules');
        const swModule = path.resolve(nodeModules, '@angular/service-worker');
        // @angular/service-worker is required to be installed when serviceWorker is true.
        if (!fs.existsSync(swModule)) {
            throw new Error(common_tags_1.stripIndent `
        Your project is configured with serviceWorker = true, but @angular/service-worker
        is not installed. Run \`npm install --save-dev @angular/service-worker\`
        and try again, or run \`ng set apps.0.serviceWorker=false\` in your .angular-cli.json.
      `);
        }
        // Read the version of @angular/service-worker and throw if it doesn't match the
        // expected version.
        const allowedVersion = '>= 1.0.0-beta.5 < 2.0.0';
        const swPackageJson = fs.readFileSync(`${swModule}/package.json`).toString();
        const swVersion = JSON.parse(swPackageJson)['version'];
        if (!semver.satisfies(swVersion, allowedVersion)) {
            throw new Error(common_tags_1.stripIndent `
        The installed version of @angular/service-worker is ${swVersion}. This version of the CLI
        requires the @angular/service-worker version to satisfy ${allowedVersion}. Please upgrade
        your service worker version.
      `);
        }
        // Path to the worker script itself.
        const workerPath = path.resolve(swModule, 'bundles/worker-basic.min.js');
        // Path to a small script to register a service worker.
        const registerPath = path.resolve(swModule, 'build/assets/register-basic.min.js');
        // Sanity check - both of these files should be present in @angular/service-worker.
        if (!fs.existsSync(workerPath) || !fs.existsSync(registerPath)) {
            throw new Error(common_tags_1.stripIndent `
        The installed version of @angular/service-worker isn't supported by the CLI.
        Please install a supported version. The following files should exist:
        - ${registerPath}
        - ${workerPath}
      `);
        }
        // CopyWebpackPlugin replaces GlobCopyWebpackPlugin, but AngularServiceWorkerPlugin depends
        // on specific behaviour from latter.
        // AngularServiceWorkerPlugin expects the ngsw-manifest.json to be present in the 'emit' phase
        // but with CopyWebpackPlugin it's only there on 'after-emit'.
        // So for now we keep it here, but if AngularServiceWorkerPlugin changes we remove it.
        extraPlugins.push(new glob_copy_webpack_plugin_1.GlobCopyWebpackPlugin({
            patterns: [
                'ngsw-manifest.json',
                { glob: 'ngsw-manifest.json', input: path.resolve(projectRoot, appConfig.root), output: '' }
            ],
            globOptions: {
                cwd: projectRoot,
                optional: true,
            },
        }));
        // Load the Webpack plugin for manifest generation and install it.
        const AngularServiceWorkerPlugin = require('@angular/service-worker/build/webpack')
            .AngularServiceWorkerPlugin;
        extraPlugins.push(new AngularServiceWorkerPlugin({
            baseHref: buildOptions.baseHref || '/',
        }));
        // Copy the worker script into assets.
        const workerContents = fs.readFileSync(workerPath).toString();
        extraPlugins.push(new static_asset_1.StaticAssetPlugin('worker-basic.min.js', workerContents));
        // Add a script to index.html that registers the service worker.
        // TODO(alxhub): inline this script somehow.
        entryPoints['sw-register'] = [registerPath];
    }
    if (buildOptions.extractLicenses) {
        extraPlugins.push(new license_webpack_plugin_1.LicenseWebpackPlugin({
            pattern: /^(MIT|ISC|BSD.*)$/,
            suppressErrors: true,
            perChunkOutput: false,
            outputFilename: `3rdpartylicenses.txt`
        }));
    }
    const uglifyCompressOptions = {};
    if (buildOptions.buildOptimizer) {
        // This plugin must be before webpack.optimize.UglifyJsPlugin.
        extraPlugins.push(new build_optimizer_1.PurifyPlugin());
        uglifyCompressOptions.pure_getters = true;
        // PURE comments work best with 3 passes.
        // See https://github.com/webpack/webpack/issues/2899#issuecomment-317425926.
        uglifyCompressOptions.passes = 3;
    }
    // Read the tsconfig to determine if we should apply ES6 uglify.
    const tsconfigPath = path.resolve(projectRoot, appConfig.root, appConfig.tsconfig);
    const tsConfig = read_tsconfig_1.readTsconfig(tsconfigPath);
    const supportES2015 = tsConfig.options.target !== projectTs.ScriptTarget.ES3
        && tsConfig.options.target !== projectTs.ScriptTarget.ES5;
    return {
        entry: entryPoints,
        plugins: [
            new webpack.EnvironmentPlugin({
                'NODE_ENV': 'production'
            }),
            new webpack.HashedModuleIdsPlugin(),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new UglifyJSPlugin({
                sourceMap: buildOptions.sourcemaps,
                uglifyOptions: {
                    ecma: supportES2015 ? 6 : 5,
                    warnings: buildOptions.verbose,
                    ie8: false,
                    mangle: true,
                    compress: uglifyCompressOptions,
                    output: {
                        ascii_only: true,
                        comments: false
                    },
                }
            }),
            ...extraPlugins
        ]
    };
}
exports.getProdConfig = getProdConfig;
//# sourceMappingURL=/users/twer/private/gde/angular-cli/models/webpack-configs/production.js.map