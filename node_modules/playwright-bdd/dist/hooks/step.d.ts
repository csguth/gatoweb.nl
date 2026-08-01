/**
 * Step level hooks: BeforeStep / AfterStep.
 */
import { KeyValue, PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { BddAutoInjectFixtures } from '../runtime/bddTestFixturesAuto';
import { HookConstructorOptions } from './shared';
import { TagsExpression } from '../steps/tags';
type StepHookType = 'beforeStep' | 'afterStep';
type StepHookOptions = {
    name?: string;
    tags?: string;
    timeout?: number;
};
type StepHookFixtures = BddAutoInjectFixtures & {
    [key: string]: unknown;
};
type StepHookFn<Fixtures, World> = (this: World, fixtures: Fixtures) => unknown;
type StepHook<Fixtures, World> = {
    type: StepHookType;
    options: StepHookOptions;
    fn: StepHookFn<Fixtures, World>;
    tagsExpression?: TagsExpression;
    location: PlaywrightLocation;
    customTest?: TestTypeCommon;
    defaultTags?: string;
    worldFixture?: string;
};
/**
 * When calling BeforeStep() / After() you can pass:
 * 1. hook fn
 * 2. tags string + hook fn
 * 3. options object + hook fn
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/api_reference.md#afteroptions-fn
 */
type StepHookDefinitionArgs<Fixtures, World> = [StepHookFn<Fixtures, World>] | [NonNullable<StepHookOptions['tags']>, StepHookFn<Fixtures, World>] | [StepHookOptions, StepHookFn<Fixtures, World>];
export type GeneralStepHook = StepHook<any, any>;
/**
 * Returns BeforeStep() / AfterStep() functions.
 */
export declare function stepHookFactory<TestFixtures extends KeyValue, WorkerFixtures extends KeyValue, World>(type: StepHookType, { customTest, defaultTags, worldFixture }: HookConstructorOptions): (...args: StepHookDefinitionArgs<TestFixtures & WorkerFixtures, World>) => void;
export declare function runStepHooks(hooks: GeneralStepHook[], world: unknown, fixtures: StepHookFixtures): Promise<void>;
export declare function getStepHooksFixtureNames(hooks: GeneralStepHook[]): string[];
export declare function getStepHooksToRun(type: StepHookType, tags?: string[]): GeneralStepHook[];
export {};
//# sourceMappingURL=step.d.ts.map