/**
 * Define steps via decorators.
 */
import { PomNode } from './pomGraph';
import { StepPattern, GherkinStepKeyword, StepDefinitionOptions, ProvidedStepOptions } from '../stepDefinition';
/**
 * Creates @Given, @When, @Then decorators.
 */
export declare function createStepDecorator(keyword: GherkinStepKeyword): (pattern: StepPattern, providedOptions?: ProvidedStepOptions) => (method: StepDefinitionOptions["fn"], _context: ClassMethodDecoratorContext) => void;
export declare function linkStepsWithPomNode(Ctor: Function, pomNode: PomNode): void;
//# sourceMappingURL=steps.d.ts.map