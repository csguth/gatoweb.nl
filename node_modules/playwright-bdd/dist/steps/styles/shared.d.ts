import { TestTypeCommon } from '../../playwright/types';
import { AnyFunction, ProvidedStepOptions, StepPattern } from '../stepDefinition';
export type StepDefinitionArgs<StepFn extends AnyFunction> = [pattern: StepPattern, fn: StepFn] | [pattern: StepPattern, providedOptions: ProvidedStepOptions, fn: StepFn];
export declare function parseStepDefinitionArgs<StepFn extends AnyFunction>(args: StepDefinitionArgs<StepFn>): {
    pattern: StepPattern;
    providedOptions: ProvidedStepOptions;
    fn: StepFn;
};
export type StepConstructorOptions = {
    worldFixture?: string;
    customTest?: TestTypeCommon;
    defaultTags?: string;
};
//# sourceMappingURL=shared.d.ts.map