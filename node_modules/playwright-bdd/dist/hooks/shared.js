"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTagsExpression = setTagsExpression;
const tags_1 = require("../steps/tags");
const paths_1 = require("../utils/paths");
function setTagsExpression(hook) {
    const { defaultTags, options, location } = hook;
    // Possibly, we should use relative to configDir
    const relFilePath = (0, paths_1.relativeToCwd)(location.file);
    const tagsFromPath = (0, tags_1.extractTagsFromPath)(relFilePath);
    hook.tagsExpression = (0, tags_1.buildTagsExpression)([...tagsFromPath, defaultTags, options.tags]);
}
//# sourceMappingURL=shared.js.map