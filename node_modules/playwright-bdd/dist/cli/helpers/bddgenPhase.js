"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBddGenPhase = isBddGenPhase;
exports.setBddGenPhase = setBddGenPhase;
/**
 * During bddgen phase there is env variable PLAYWRIGHT_BDD_GEN set to '1'.
 * Keep this file separate as it is imported in workers -> no unneeded dependencies.
 * @public
 */
function isBddGenPhase() {
    return Boolean(process.env.PLAYWRIGHT_BDD_GEN);
}
function setBddGenPhase() {
    process.env.PLAYWRIGHT_BDD_GEN = '1';
}
//# sourceMappingURL=bddgenPhase.js.map