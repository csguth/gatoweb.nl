"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snippet = void 0;
const cucumber_expressions_1 = require("@cucumber/cucumber-expressions");
const parameterTypes_1 = require("../steps/parameterTypes");
const messages_1 = require("@cucumber/messages");
class Snippet {
    constructor(missingStep, options) {
        this.missingStep = missingStep;
        this.options = options;
        this.generatedExpression = this.generateExpression();
        this.code = this.options.isDecorator ? this.buildDecoratorCode() : this.buildCode();
    }
    get pickleStep() {
        return this.missingStep.pickleStep;
    }
    buildCode() {
        const stepType = this.getStepType();
        const pattern = this.getPattern();
        const stepFn = this.getStepFunction();
        return [
            `${stepType}(${pattern}, ${stepFn}`, // prettier-ignore
            `  // {step}`,
            `  // {location}`,
            '});',
        ].join('\n');
    }
    buildDecoratorCode() {
        const stepType = this.getStepType();
        const pattern = this.getPattern();
        return `@${stepType}(${pattern}); // {location}`;
    }
    getStepType() {
        switch (this.pickleStep.type) {
            case messages_1.PickleStepType.ACTION:
                return 'When';
            case messages_1.PickleStepType.OUTCOME:
                return 'Then';
            case messages_1.PickleStepType.CONTEXT:
            case messages_1.PickleStepType.UNKNOWN:
            default:
                return 'Given';
        }
    }
    getPattern() {
        return `'${escapeSpecialCharacters(this.generatedExpression.source)}'`;
    }
    getStepFunction() {
        const args = this.getStepFunctionArguments().join(', ');
        return this.options.isPlaywrightStyle
            ? `async (${args}) => {` // prettier-ignore
            : `async function (${args}) {`;
    }
    getStepFunctionArguments() {
        return [
            this.options.isPlaywrightStyle ? '{}' : '',
            ...this.getPatternArguments(),
            this.getLastArgument(),
        ].filter(Boolean);
    }
    getPatternArguments() {
        return this.generatedExpression.parameterNames.map((name, i) => {
            const argName = `arg${i === 0 ? '' : i}`;
            const type = name.startsWith('string') ? 'string' : 'number';
            return this.options.isTypeScript ? `${argName}: ${type}` : argName;
        });
    }
    getLastArgument() {
        const { argument } = this.pickleStep;
        if (!argument)
            return;
        const [argName, type] = argument.dataTable
            ? ['dataTable', 'DataTable']
            : ['docString', 'string'];
        return this.options.isTypeScript ? `${argName}: ${type}` : argName;
    }
    generateExpression() {
        const cucumberExpressionGenerator = new cucumber_expressions_1.CucumberExpressionGenerator(() => parameterTypes_1.parameterTypeRegistry.parameterTypes);
        const generatedExpressions = cucumberExpressionGenerator.generateExpressions(this.pickleStep.text);
        // Always take only first generatedExpression
        // Other expressions are for int/float combinations
        const firstExpression = generatedExpressions[0];
        if (!firstExpression) {
            throw new Error(`Could not generate expression for step: ${this.pickleStep.text}`);
        }
        return firstExpression;
    }
}
exports.Snippet = Snippet;
function escapeSpecialCharacters(source) {
    return (source
        // double up any backslashes because we're in a javascript string
        .replace(/\\/g, '\\\\')
        // escape any single quotes because that's our quote delimiter
        .replace(/'/g, "\\'"));
}
//# sourceMappingURL=snippet.js.map