#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const test_1 = require("./commands/test");
const env_1 = require("./commands/env");
const export_1 = require("./commands/export");
const utils_1 = require("../utils");
const options_1 = require("./options");
const program = new commander_1.Command();
const version = (0, utils_1.getPackageVersion)('playwright-bdd');
program
    .name('bddgen')
    .description(`Playwright-bdd CLI v${version}`)
    .addOption(options_1.configOption)
    .version(version, '-v, --version', 'Output playwright-bdd version')
    .helpCommand(false)
    .addCommand(test_1.testCommand, { isDefault: true })
    .addCommand(export_1.exportCommand)
    .addCommand(env_1.envCommand)
    .parse();
//# sourceMappingURL=index.js.map