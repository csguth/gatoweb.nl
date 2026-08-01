/**
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/pickle_parser.ts
 */
import * as messages from '@cucumber/messages';
interface IGetStepKeywordRequest {
    pickleStep: messages.PickleStep;
    gherkinStepMap: Record<string, messages.Step>;
}
interface IGetScenarioDescriptionRequest {
    pickle: messages.Pickle;
    gherkinScenarioMap: Record<string, messages.Scenario>;
}
export declare function getScenarioDescription({ pickle, gherkinScenarioMap, }: IGetScenarioDescriptionRequest): string;
export declare function getStepKeyword({ pickleStep, gherkinStepMap }: IGetStepKeywordRequest): string;
export declare function getPickleStepMap(pickle: messages.Pickle): Record<string, messages.PickleStep>;
export {};
//# sourceMappingURL=PickleParser.d.ts.map