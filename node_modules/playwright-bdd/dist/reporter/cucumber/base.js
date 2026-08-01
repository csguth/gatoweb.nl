"use strict";
/**
 * Base reporter for Cucumber reporters.
 * Reference: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/index.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const promises_1 = require("node:stream/promises");
const node_events_1 = require("node:events");
class BaseReporter {
    constructor(internalOptions) {
        this.internalOptions = internalOptions;
        this.eventBroadcaster = new node_events_1.EventEmitter();
        this.outputStream = process.stdout;
        this.outputDir = '';
    }
    get eventDataCollector() {
        return this.internalOptions.messagesBuilder.eventDataCollector;
    }
    get messagesBuilder() {
        return this.internalOptions.messagesBuilder;
    }
    printsToStdio() {
        return isStdout(this.outputStream);
    }
    async init() { }
    async finished() {
        if (!isStdout(this.outputStream)) {
            this.outputStream.end();
            await (0, promises_1.finished)(this.outputStream);
        }
    }
    setOutputStream(outputFile) {
        if (!outputFile)
            return;
        const absolutePath = node_path_1.default.resolve(this.internalOptions.cwd, outputFile);
        this.outputDir = node_path_1.default.dirname(absolutePath);
        node_fs_1.default.mkdirSync(this.outputDir, { recursive: true });
        this.outputStream = node_fs_1.default.createWriteStream(absolutePath);
    }
}
exports.default = BaseReporter;
function isStdout(stream) {
    return stream === process.stdout;
}
//# sourceMappingURL=base.js.map