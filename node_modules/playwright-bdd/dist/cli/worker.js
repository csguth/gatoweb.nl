"use strict";
/**
 * Worker to generate test files with fresh require/import cache
 * See: https://github.com/nodejs/modules/issues/307#issuecomment-858729422
 */
Object.defineProperty(exports, "__esModule", { value: true });
const node_worker_threads_1 = require("node:worker_threads");
const generate_1 = require("../generate");
main();
async function main() {
    try {
        await new generate_1.TestFilesGenerator(node_worker_threads_1.workerData.config).generate();
    }
    catch (e) {
        // eslint-disable-next-line no-console
        if (e.message)
            console.error(e.message);
        process.exitCode = 1;
    }
}
//# sourceMappingURL=worker.js.map