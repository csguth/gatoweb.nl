/**
 * Class level @Fixture decorator.
 *
 * This decorator is needed to get access to class Constructor,
 * that in turn is needed to build POM inheritance graph using prototype chain.
 * Method decorators don't have access to Constructor in decoration phase,
 * only in runtime (that is too late).
 *
 * There was idea to use the following way of creating decorators,
 * that eliminates usage of @Fixture:
 * const { Given, When, Then } = createBddDecorators(test, { pomFixture: 'myPOM' });
 * But due to above reason it's not possible.
 * Also it leads to cyclic dependencies: fixture imports test, and test imports fixture.
 */
import { TestType } from '@playwright/test';
import { KeyValue, PwBuiltInFixturesTest } from '../../playwright/types';
type AvailableFixtures<T extends KeyValue> = T extends TestType<infer U, any> ? U : T;
type CustomTestFixtureName<T extends KeyValue> = Exclude<keyof AvailableFixtures<T>, keyof PwBuiltInFixturesTest | number | symbol>;
type FixtureOptions<T extends KeyValue> = {
    name?: CustomTestFixtureName<T>;
    tags?: string;
};
export declare function Fixture<T extends KeyValue>(arg: CustomTestFixtureName<T> | FixtureOptions<T>): (Ctor: Function, _context: ClassDecoratorContext) => void;
export {};
//# sourceMappingURL=fixture.d.ts.map