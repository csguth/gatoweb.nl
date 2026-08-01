/**
 * Storing configs in env var PLAYWRIGHT_BDD_CONFIGS as JSON-stringified values.
 * For passing configs to playwright workers and bddgen.
 */
import { BDDConfig } from './types';
type EnvConfigs = Record<string, BDDConfig>;
/**
 * Returns config dir for the first BDD config in env.
 */
export declare function getConfigDirFromEnv<T extends boolean = true>({ throws }?: {
    throws?: T | undefined;
}): T extends true ? string : string | undefined;
export declare function saveConfigToEnv(config: BDDConfig): void;
/**
 * Note: Playwright's project.testDir is the same as BDD outputDir.
 */
export declare function getConfigFromEnv(absOutputDir: string): BDDConfig;
export declare function getEnvConfigs(): EnvConfigs;
export {};
//# sourceMappingURL=env.d.ts.map