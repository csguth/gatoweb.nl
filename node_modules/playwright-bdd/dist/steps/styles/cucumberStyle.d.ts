import { AnyFunction, GherkinStepKeyword } from '../stepDefinition';
import { StepConstructorOptions, StepDefinitionArgs } from './shared';
export type CucumberStyleStepFn<World> = (this: World, ...args: any[]) => unknown;
export type CucumberStyleStepCtor<T extends AnyFunction> = <StepFn extends T>(...args: StepDefinitionArgs<StepFn>) => StepFn;
export declare function cucumberStepCtor(keyword: GherkinStepKeyword, { customTest, worldFixture, defaultTags }: StepConstructorOptions): <StepFn extends AnyFunction>(...args: StepDefinitionArgs<StepFn>) => StepFn;
//# sourceMappingURL=cucumberStyle.d.ts.map