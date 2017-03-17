"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_tools_1 = require("../../lib/ast-tools");
const config_1 = require("../../models/config");
const app_utils_1 = require("../../utilities/app-utils");
const common_tags_1 = require("common-tags");
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const dynamicPathParser = require('../../utilities/dynamic-path-parser');
const Blueprint = require('../../ember-cli/lib/models/blueprint');
const stringUtils = require('ember-cli-string-utils');
const astUtils = require('../../utilities/ast-utils');
const getFiles = Blueprint.prototype.files;
exports.default = Blueprint.extend({
    description: '',
    aliases: ['s'],
    availableOptions: [
        {
            name: 'flat',
            type: Boolean,
            description: 'Flag to indicate if a dir is created.'
        },
        {
            name: 'spec',
            type: Boolean,
            description: 'Specifies if a spec file is generated.'
        },
        {
            name: 'module',
            type: String, aliases: ['m'],
            description: 'Allows specification of the declaring module.'
        },
        {
            name: 'app',
            type: String,
            aliases: ['a'],
            description: 'Specifies app name to use.'
        }
    ],
    beforeInstall: function (options) {
        if (options.module) {
            // Resolve path to module
            const modulePath = options.module.endsWith('.ts') ? options.module : `${options.module}.ts`;
            const appConfig = app_utils_1.getAppFromConfig(this.options.app);
            const parsedPath = dynamicPathParser(this.project, modulePath, appConfig);
            this.pathToModule = path.join(this.project.root, parsedPath.dir, parsedPath.base);
            if (!fs.existsSync(this.pathToModule)) {
                throw 'Module specified does not exist';
            }
        }
    },
    normalizeEntityName: function (entityName) {
        const appConfig = app_utils_1.getAppFromConfig(this.options.app);
        const parsedPath = dynamicPathParser(this.project, entityName, appConfig);
        this.dynamicPath = parsedPath;
        return parsedPath.name;
    },
    locals: function (options) {
        options.flat = options.flat !== undefined ?
            options.flat : config_1.CliConfig.getValue('defaults.service.flat');
        options.spec = options.spec !== undefined ?
            options.spec : config_1.CliConfig.getValue('defaults.service.spec');
        return {
            dynamicPath: this.dynamicPath.dir,
            flat: options.flat
        };
    },
    files: function () {
        let fileList = getFiles.call(this);
        if (this.options && !this.options.spec) {
            fileList = fileList.filter(p => p.indexOf('__name__.service.spec.ts') < 0);
        }
        return fileList;
    },
    fileMapTokens: function (options) {
        // Return custom template variables here.
        return {
            __path__: () => {
                let dir = this.dynamicPath.dir;
                if (!options.locals.flat) {
                    dir += path.sep + options.dasherizedModuleName;
                }
                this.generatePath = dir;
                return dir;
            }
        };
    },
    afterInstall(options) {
        const returns = [];
        if (!this.pathToModule) {
            const warningMessage = common_tags_1.oneLine `
        Service is generated but not provided,
        it must be provided to be used
      `;
            this._writeStatusToUI(chalk.yellow, 'WARNING', warningMessage);
        }
        else {
            const className = stringUtils.classify(`${options.entity.name}Service`);
            const fileName = stringUtils.dasherize(`${options.entity.name}.service`);
            const fullGeneratePath = path.join(this.project.root, this.generatePath);
            const moduleDir = path.parse(this.pathToModule).dir;
            const relativeDir = path.relative(moduleDir, fullGeneratePath);
            const importPath = relativeDir ? `./${relativeDir}/${fileName}` : `./${fileName}`;
            returns.push(astUtils.addProviderToModule(this.pathToModule, className, importPath)
                .then((change) => change.apply(ast_tools_1.NodeHost)));
            this._writeStatusToUI(chalk.yellow, 'update', path.relative(this.project.root, this.pathToModule));
        }
        return Promise.all(returns);
    }
});
//# sourceMappingURL=/users/twer/private/gde/angular-cli/blueprints/service/index.js.map