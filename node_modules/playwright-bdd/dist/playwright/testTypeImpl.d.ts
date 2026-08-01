import { TestTypeCommon } from './types';
export declare function isPlaywrightTestInstance(value: unknown): value is TestTypeCommon;
/**
 * Returns true if test contains all fixtures of subtest.
 * - test was extended from subtest
 * - test is a result of mergeTests(subtest, ...)
 */
export declare function isTestContainsSubtest(test: TestTypeCommon, subtest: TestTypeCommon): boolean;
export declare function isTestContainsFixture(test: TestTypeCommon, fixtureName: string): true | undefined;
//# sourceMappingURL=testTypeImpl.d.ts.map