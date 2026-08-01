/**
 * Scenario level hooks: Before / After.
 */
import { KeyValue, PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { HookConstructorOptions } from './shared';
import { TagsExpression } from '../steps/tags';
import { BddContext } from '../runtime/bddContext';
export type ScenarioHookType = 'before' | 'after';
type ScenarioHookOptions = {
    name?: string;
    tags?: string;
    timeout?: number;
};
type ScenarioHookFixtures = {
    $bddContext: BddContext;
    [key: string]: unknown;
};
type ScenarioHookFn<Fixtures, World> = (this: World, fixtures: Fixtures) => unknown;
type ScenarioHook<Fixtures, World> = {
    type: ScenarioHookType;
    options: ScenarioHookOptions;
    fn: ScenarioHookFn<Fixtures, World>;
    tagsExpression?: TagsExpression;
    location: PlaywrightLocation;
    customTest?: TestTypeCommon;
    defaultTags?: string;
    worldFixture?: string;
};
/**
 * When calling Before() / After() you can pass:
 * 1. hook fn
 * 2. tags string + hook fn
 * 3. options object + hook fn
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/api_reference.md#afteroptions-fn
 */
type ScenarioHookDefinitionArgs<Fixtures, World> = [ScenarioHookFn<Fixtures, World>] | [NonNullable<ScenarioHookOptions['tags']>, ScenarioHookFn<Fixtures, World>] | [ScenarioHookOptions, ScenarioHookFn<Fixtures, World>];
export type GeneralScenarioHook = ScenarioHook<any, any>;
/**
 * Returns Before() / After() functions.
 */
export declare function scenarioHookFactory<TestFixtures extends KeyValue, WorkerFixtures extends KeyValue, World>(type: ScenarioHookType, { customTest, defaultTags, worldFixture }: HookConstructorOptions): (...args: ScenarioHookDefinitionArgs<TestFixtures & WorkerFixtures, World>) => void;
export declare function runScenarioHooks(hooks: GeneralScenarioHook[], world: unknown, fixtures: ScenarioHookFixtures): Promise<void>;
export declare function getScenarioHooksFixtureNames(hooks: GeneralScenarioHook[]): string[];
export declare function getScenarioHooksToRun(type: ScenarioHookType, tags?: string[]): GeneralScenarioHook[];
export {};
//# sourceMappingURL=scenario.d.ts.map