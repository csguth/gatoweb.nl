/**
 * Builds Pickle messages.
 */
import * as messages from '@cucumber/messages';
import { AutofillMap } from '../../../utils/AutofillMap';
import { TestCase } from './TestCase';
export declare class Pickles {
    buildMessages(testCases: AutofillMap<string, TestCase>): Required<Pick<messages.Envelope, "pickle">>[];
    private buildPickleMessage;
}
//# sourceMappingURL=Pickles.d.ts.map