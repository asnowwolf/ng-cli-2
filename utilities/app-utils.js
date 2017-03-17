"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../models/config");
function getAppFromConfig(nameOrIndex) {
    const apps = config_1.CliConfig.getValue('apps');
    let app = apps[0];
    if (nameOrIndex) {
        if (nameOrIndex.match(/^[0-9]+$/)) {
            const index = parseInt(nameOrIndex.toString(), 10);
            app = apps[index];
        }
        else {
            const filtered = apps.filter((currentApp) => currentApp.name === nameOrIndex);
            if (filtered.length > 0) {
                app = filtered[0];
            }
        }
    }
    return app;
}
exports.getAppFromConfig = getAppFromConfig;
//# sourceMappingURL=/users/twer/private/gde/angular-cli/utilities/app-utils.js.map