"use strict";
var fs = require('fs');
var path = require('path');
var common_tags_1 = require('common-tags');
var stringUtils = require('ember-cli-string-utils');
var Command = require('../ember-cli/lib/models/command');
var lookupCommand = require('../ember-cli/lib/cli/lookup-command');
function extractOptions(opts) {
    var output = [];
    for (var index = 0; index < opts.length; index++) {
        var element = opts[index];
        output.push('--' + element.name);
        if (element.aliases) {
            output.push('-' + element.aliases[0]);
        }
    }
    return output.sort().join(' ');
}
;
var commandsToIgnore = [
    'easter-egg',
    'destroy',
    'github-pages-deploy' // errors because there is no base github-pages command
];
var optsNg = [];
var CompletionCommand = Command.extend({
    name: 'completion',
    description: 'Adds autocomplete functionality to `ng` commands and subcommands',
    works: 'everywhere',
    availableOptions: [
        { name: 'all', type: Boolean, default: true, aliases: ['a'] },
        { name: 'bash', type: Boolean, default: false, aliases: ['b'] },
        { name: 'zsh', type: Boolean, default: false, aliases: ['z'] }
    ],
    run: function (commandOptions) {
        var _this = this;
        commandOptions.all = !commandOptions.bash && !commandOptions.zsh;
        var commandFiles = fs.readdirSync(__dirname)
            .filter(function (file) { return file.match(/\.ts$/) && !file.match(/\.run.ts$/); })
            .map(function (file) { return path.parse(file).name; })
            .filter(function (file) {
            return commandsToIgnore.indexOf(file) < 0;
        })
            .map(function (file) { return file.toLowerCase(); });
        var commandMap = commandFiles.reduce(function (acc, curr) {
            var classifiedName = stringUtils.classify(curr);
            var defaultImport = require("./" + curr).default;
            acc[classifiedName] = defaultImport;
            return acc;
        }, {});
        var caseBlock = '';
        commandFiles.forEach(function (cmd) {
            var Command = lookupCommand(commandMap, cmd);
            var com = [];
            var command = new Command({
                ui: _this.ui,
                project: _this.project,
                commands: _this.commands,
                tasks: _this.tasks
            });
            optsNg.push(command.name);
            com.push(command.name);
            if (command.aliases) {
                command.aliases.forEach(function (element) {
                    optsNg.push(element);
                    com.push(element);
                });
            }
            if (command.availableOptions && command.availableOptions[0]) {
                var opts = extractOptions(command.availableOptions);
                caseBlock = caseBlock + '    ' + com.sort().join('|') + ') opts="' + opts + '" ;;\n';
            }
        });
        caseBlock = 'ng|help) opts="' + optsNg.sort().join(' ') + '" ;;\n' +
            caseBlock +
            '    *) opts="" ;;';
        console.log((_a = ["\n      ###-begin-ng-completion###\n      #\n\n      # ng command completion script\n      #   This command supports 3 cases.\n      #   1. (Default case) It prints a common completion initialisation for both Bash and Zsh.\n      #      It is the result of either calling \"ng completion\" or \"ng completion -a\".\n      #   2. Produce Bash-only completion: \"ng completion -b\" or \"ng completion --bash\".\n      #   3. Produce Zsh-only completion: \"ng completion -z\" or \"ng completion --zsh\".\n      #\n      # Installation: ng completion -b >> ~/.bashrc\n      #           or  ng completion -z >> ~/.zshrc\n      #"], _a.raw = ["\n      ###-begin-ng-completion###\n      #\n\n      # ng command completion script\n      #   This command supports 3 cases.\n      #   1. (Default case) It prints a common completion initialisation for both Bash and Zsh.\n      #      It is the result of either calling \"ng completion\" or \"ng completion -a\".\n      #   2. Produce Bash-only completion: \"ng completion -b\" or \"ng completion --bash\".\n      #   3. Produce Zsh-only completion: \"ng completion -z\" or \"ng completion --zsh\".\n      #\n      # Installation: ng completion -b >> ~/.bashrc\n      #           or  ng completion -z >> ~/.zshrc\n      #"], common_tags_1.stripIndent(_a)));
        if (commandOptions.all && !commandOptions.bash) {
            console.log('if test ".$(type -t complete 2>/dev/null || true)" = ".builtin"; then');
        }
        if (commandOptions.all || commandOptions.bash) {
            console.log((_b = ["\n          _ng_completion() {\n           local cword pword opts\n\n           COMPREPLY=()\n           cword=${COMP_WORDS[COMP_CWORD]}\n           pword=${COMP_WORDS[COMP_CWORD - 1]}\n\n           case ${pword} in\n             ", "\n           esac\n\n           COMPREPLY=( $(compgen -W '${opts}' -- $cword) )\n\n           return 0\n         }\n\n         complete -o default -F _ng_completion ng\n         "], _b.raw = ["\n          _ng_completion() {\n           local cword pword opts\n\n           COMPREPLY=()\n           cword=\\${COMP_WORDS[COMP_CWORD]}\n           pword=\\${COMP_WORDS[COMP_CWORD - 1]}\n\n           case \\${pword} in\n             ", "\n           esac\n\n           COMPREPLY=( $(compgen -W '\\${opts}' -- $cword) )\n\n           return 0\n         }\n\n         complete -o default -F _ng_completion ng\n         "], common_tags_1.stripIndent(_b, caseBlock)));
        }
        if (commandOptions.all) {
            console.log((_c = ["\n        elif test \".$(type -w compctl 2>/dev/null || true)\" = \".compctl: builtin\" ; then\n        "], _c.raw = ["\n        elif test \".$(type -w compctl 2>/dev/null || true)\" = \".compctl: builtin\" ; then\n        "], common_tags_1.stripIndent(_c)));
        }
        if (commandOptions.all || commandOptions.zsh) {
            console.log((_d = ["\n          _ng_completion () {\n            local words cword opts\n            read -Ac words\n            read -cn cword\n            let cword-=1\n\n            case $words[cword] in\n              ", "\n            esac\n\n            setopt shwordsplit\n            reply=($opts)\n            unset shwordsplit\n          }\n\n          compctl -K _ng_completion ng\n          "], _d.raw = ["\n          _ng_completion () {\n            local words cword opts\n            read -Ac words\n            read -cn cword\n            let cword-=1\n\n            case $words[cword] in\n              ", "\n            esac\n\n            setopt shwordsplit\n            reply=($opts)\n            unset shwordsplit\n          }\n\n          compctl -K _ng_completion ng\n          "], common_tags_1.stripIndent(_d, caseBlock)));
        }
        if (commandOptions.all) {
            console.log((_e = ["\n        else\n          echo \"Builtin command 'complete' or 'compctl' is redefined; cannot produce completion.\"\n          return 1\n        fi"], _e.raw = ["\n        else\n          echo \"Builtin command 'complete' or 'compctl' is redefined; cannot produce completion.\"\n          return 1\n        fi"], common_tags_1.stripIndent(_e)));
        }
        console.log('###-end-ng-completion###');
        var _a, _b, _c, _d, _e;
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CompletionCommand;
//# sourceMappingURL=/Users/twer/dev/sdk/angular-cli/packages/@angular/cli/commands/completion.js.map