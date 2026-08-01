/**
 * Config option moved to separate file as it used in test run.
 */
import { Option } from 'commander';
export type ConfigOption = {
    config?: string;
};
export declare const configOption: Option;
/**
 * Helper used in test run to detect config location.
 */
export declare function getCliConfigPath(): any;
//# sourceMappingURL=options.d.ts.map