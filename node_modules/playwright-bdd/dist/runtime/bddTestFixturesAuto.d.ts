/**
 * Auto-inject fixtures are automatically injected into every step/hook call
 * without explicitly passing them in the last argument of Given() / When() / Then().
 * These fixtures are instantiated, although not enumerated in PW test signature,
 * b/c all of them are used in bddContext, that is always created for BDD tests.
 *
 * We still define them in test.extend() to have correct typings and allow these fixtures
 * to be used in user's custom fixtures.
 *
 * The main goal of auto-fixtures is to have cleaner generated code.
 */
import { BddContext } from './bddContext';
import { BddTestFixtures } from './bddTestFixtures';
export type BddAutoInjectFixtures = Pick<BddTestFixtures, '$test' | '$tags' | '$step' | '$testInfo' | '$bddContext'>;
export declare function isBddAutoInjectFixture(name: string): boolean;
export declare function getBddAutoInjectFixtures(bddContext: BddContext): BddAutoInjectFixtures;
//# sourceMappingURL=bddTestFixturesAuto.d.ts.map