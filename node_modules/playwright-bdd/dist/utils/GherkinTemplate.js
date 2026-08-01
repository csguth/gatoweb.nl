"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GherkinTemplate = void 0;
/**
 * Represents Gherkin template: string with <> placeholders.
 * Example: 'Given <name> is <age> years old'
 */
class GherkinTemplate {
    constructor(template) {
        this.template = template;
    }
    fill(params) {
        return this.template.replace(/<(.+?)>/g, (match, key) => {
            return params[key] !== undefined ? String(params[key]) : match;
        });
    }
    extractParams() {
        return [...this.template.matchAll(/<(.+?)>/g)].map((m) => m[1]);
    }
}
exports.GherkinTemplate = GherkinTemplate;
//# sourceMappingURL=GherkinTemplate.js.map