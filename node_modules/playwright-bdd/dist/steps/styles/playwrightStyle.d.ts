/**
 * Playwright-style steps.
 */
import { KeyValue } from '../../playwright/types';
import { ParametersExceptFirst } from '../../utils/types';
import { StepPattern, GherkinStepKeyword, AnyFunction } from '../stepDefinition';
import { StepConstructorOptions, StepDefinitionArgs } from './shared';
export type PlaywrightStyleStepFn<T extends KeyValue, W extends KeyValue> = (this: Record<string, any>, fixtures: T & W, ...args: any[]) => unknown;
export type PlaywrightStyleStepCtor<T extends AnyFunction> = <StepFn extends T>(...args: StepDefinitionArgs<StepFn>) => ReturnType<typeof getCallableStepFn<StepFn>>;
export declare function playwrightStepCtor(keyword: GherkinStepKeyword, { customTest, defaultTags }: StepConstructorOptions): <StepFn extends AnyFunction>(...args: StepDefinitionArgs<StepFn>) => (this: any, ...args: Parameters<StepFn> extends [] ? [] : [Partial<Parameters<StepFn>[0]>, ...ParametersExceptFirst<StepFn>]) => unknown;
/**
 * Returns wrapped step function to be called from other steps.
 * See: https://github.com/vitalets/playwright-bdd/issues/110
 */
declare function getCallableStepFn<StepFn extends AnyFunction>(pattern: StepPattern, fn: StepFn): (this: any, ...args: Parameters<StepFn> extends [] ? [] : [Partial<Parameters<StepFn>[0]>, ...ParametersExceptFirst<StepFn>]) => unknown;
export {};
//# sourceMappingURL=playwrightStyle.d.ts.map