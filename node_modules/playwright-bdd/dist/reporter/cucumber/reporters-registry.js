"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesBuilder = getMessagesBuilder;
exports.registerReporter = registerReporter;
exports.unregisterReporter = unregisterReporter;
/**
 * Keep track of the Cucumber reporters count and messagesBuilder instance.
 */
const messagesBuilder_1 = require("./messagesBuilder");
let cucumberReportersCount = 0;
let messagesBuilder;
function getMessagesBuilder() {
    if (!messagesBuilder)
        messagesBuilder = new messagesBuilder_1.MessagesBuilder();
    return messagesBuilder;
}
function registerReporter() {
    cucumberReportersCount++;
    return cucumberReportersCount === 1;
}
function unregisterReporter() {
    cucumberReportersCount = Math.max(0, cucumberReportersCount - 1);
    // Recreate messagesBuilder on each test run.
    // (mainly applicable to the runs from VS code extension)
    if (cucumberReportersCount === 0)
        messagesBuilder = null;
}
//# sourceMappingURL=reporters-registry.js.map