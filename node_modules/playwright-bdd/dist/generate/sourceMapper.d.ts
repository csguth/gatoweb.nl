/**
 * Maps generated file lines to test and step locations.
 */
import { Pickle, PickleStep } from '@cucumber/messages';
export declare class SourceMapper {
    private pwTestLocations;
    private pwStepLocations;
    constructor(lines: string[]);
    getPwTestLine(pickle: Pickle): number;
    getPwStepLine(pickleStep: PickleStep): number;
    private fillPwTestLocations;
    private fillPwStepLocations;
}
//# sourceMappingURL=sourceMapper.d.ts.map