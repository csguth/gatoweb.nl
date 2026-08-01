/**
 * DataTable class.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/models/data_table.ts
 */
import * as messages from '@cucumber/messages';
export declare class DataTable {
    private readonly rawTable;
    constructor(sourceTable: messages.PickleTable | string[][]);
    hashes(): Record<string, string>[];
    raw(): string[][];
    rows(): string[][];
    rowsHash(): Record<string, string>;
    transpose(): DataTable;
}
//# sourceMappingURL=DataTable.d.ts.map