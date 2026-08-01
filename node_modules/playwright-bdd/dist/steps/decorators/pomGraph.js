"use strict";
/**
 * Tree-structure of all POM classes.
 * Allows to guess correct fixture for decorator steps.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPomNode = createPomNode;
exports.getPomNodeByFixtureName = getPomNodeByFixtureName;
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
const steps_1 = require("./steps");
const exit_1 = require("../../utils/exit");
const pomGraph = new Map();
function createPomNode(Ctor, fixtureName, fixtureTags) {
    const pomNode = {
        fixtureName,
        fixtureTags,
        className: Ctor.name,
        children: new Set(),
    };
    ensureUniqueFixtureName(pomNode);
    pomGraph.set(Ctor, pomNode);
    (0, steps_1.linkStepsWithPomNode)(Ctor, pomNode);
    linkParentWithPomNode(Ctor, pomNode);
    return pomNode;
}
function ensureUniqueFixtureName({ fixtureName, className }) {
    if (!fixtureName)
        return;
    const existingPom = getPomNodeByFixtureName(fixtureName);
    if (existingPom)
        (0, exit_1.exit)(`Duplicate fixture name "${fixtureName}"`, `defined for classes: ${existingPom.className}, ${className}`);
}
function linkParentWithPomNode(Ctor, pomNode) {
    const parentCtor = Object.getPrototypeOf(Ctor);
    if (!parentCtor)
        return;
    // if parentCtor is not in pomGraph, add it.
    // Case: parent class is not marked with @Fixture, but has decorator steps (base class)
    const parentPomNode = pomGraph.get(parentCtor) || createPomNode(parentCtor, '');
    parentPomNode.children.add(pomNode);
}
function getPomNodeByFixtureName(fixtureName) {
    for (const pomNode of pomGraph.values()) {
        if (pomNode.fixtureName === fixtureName)
            return pomNode;
    }
}
//# sourceMappingURL=pomGraph.js.map