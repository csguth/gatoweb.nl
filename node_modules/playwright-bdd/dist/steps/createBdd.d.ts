/**
 * createBdd() definition.
 */
import { PwBuiltInFixturesTest, PwBuiltInFixturesWorker, KeyValue } from '../playwright/types';
import { TestType } from '@playwright/test';
import { BddTestFixtures } from '../runtime/bddTestFixtures';
import { CucumberStyleStepCtor, CucumberStyleStepFn } from './styles/cucumberStyle';
import { PlaywrightStyleStepCtor, PlaywrightStyleStepFn } from './styles/playwrightStyle';
import { BddWorkerFixtures } from '../runtime/bddWorkerFixtures';
type CreateBddOptions<WorldFixtureName> = {
    worldFixture?: WorldFixtureName;
    tags?: string;
};
type DefaultFixturesTest = PwBuiltInFixturesTest & BddTestFixtures;
type DefaultFixturesWorker = PwBuiltInFixturesWorker & BddWorkerFixtures;
type CustomFixtureNames<T extends KeyValue> = Exclude<keyof T, keyof DefaultFixturesTest | number | symbol>;
export declare function createBdd<T extends KeyValue = DefaultFixturesTest, W extends KeyValue = DefaultFixturesWorker, WorldFixtureName extends CustomFixtureNames<T> | '' = ''>(customTest?: TestType<T, W>, options?: CreateBddOptions<WorldFixtureName>): {
    Given: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepCtor<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepFn<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null> : PlaywrightStyleStepFn<T, W>> : PlaywrightStyleStepCtor<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepFn<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null> : PlaywrightStyleStepFn<T, W>>;
    When: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepCtor<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepFn<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null> : PlaywrightStyleStepFn<T, W>> : PlaywrightStyleStepCtor<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepFn<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null> : PlaywrightStyleStepFn<T, W>>;
    Then: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepCtor<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepFn<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null> : PlaywrightStyleStepFn<T, W>> : PlaywrightStyleStepCtor<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepFn<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null> : PlaywrightStyleStepFn<T, W>>;
    Step: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepCtor<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepFn<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null> : PlaywrightStyleStepFn<T, W>> : PlaywrightStyleStepCtor<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? CucumberStyleStepFn<WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null> : PlaywrightStyleStepFn<T, W>>;
    BeforeAll: (...args: [(fixtures: W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (fixtures: W) => unknown]) => void;
    AfterAll: (...args: [(fixtures: W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (fixtures: W) => unknown]) => void;
    Before: (...args: [(this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [string, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown]) => void;
    After: (...args: [(this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [string, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown]) => void;
    BeforeWorker: (...args: [(fixtures: W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (fixtures: W) => unknown]) => void;
    AfterWorker: (...args: [(fixtures: W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (fixtures: W) => unknown]) => void;
    BeforeScenario: (...args: [(this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [string, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown]) => void;
    AfterScenario: (...args: [(this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [string, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown]) => void;
    BeforeStep: (...args: [(this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [string, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown]) => void;
    AfterStep: (...args: [(this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [string, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown] | [{
        name?: string;
        tags?: string;
        timeout?: number;
    }, (this: WorldFixtureName extends Exclude<keyof T, number | symbol | keyof import("@playwright/test").PlaywrightTestArgs | keyof import("@playwright/test").PlaywrightTestOptions | keyof BddTestFixtures> ? T[WorldFixtureName] : null, fixtures: T & W) => unknown]) => void;
};
export {};
//# sourceMappingURL=createBdd.d.ts.map