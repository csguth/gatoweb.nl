/**
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/gherkin_document_parser.ts
 */
import * as messages from '@cucumber/messages';
export declare function getGherkinStepMap(gherkinDocument: messages.GherkinDocument): Record<string, messages.Step>;
export declare function getGherkinScenarioMap(gherkinDocument: messages.GherkinDocument): Record<string, messages.Scenario>;
export declare function getGherkinExampleRuleMap(gherkinDocument: messages.GherkinDocument): Record<string, messages.Rule>;
export declare function getGherkinScenarioLocationMap(gherkinDocument: messages.GherkinDocument): Record<string, messages.Location>;
//# sourceMappingURL=GherkinDocumentParser.d.ts.map