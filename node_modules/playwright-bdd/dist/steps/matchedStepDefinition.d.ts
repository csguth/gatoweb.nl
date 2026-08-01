/**
 * Matched step definition.
 */
import { Argument } from '@cucumber/cucumber-expressions';
import { StepMatchArgument } from '@cucumber/messages';
import { StepDefinition } from './stepDefinition';
export declare class MatchedStepDefinition {
    definition: StepDefinition;
    stepText: string;
    result: readonly Argument[];
    constructor(definition: StepDefinition, stepText: string, result: readonly Argument[]);
    getMatchedParameters(world: unknown): Promise<unknown[]>;
    /**
     * Returns step arguments in format suitable for reporter.
     * See: https://github.com/cucumber/cucumber-js/blob/main/src/assemble/assemble_test_cases.ts
     */
    getStepMatchArguments(): StepMatchArgument[];
}
//# sourceMappingURL=matchedStepDefinition.d.ts.map