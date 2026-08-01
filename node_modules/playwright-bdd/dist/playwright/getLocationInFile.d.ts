import { PlaywrightLocation } from './types';
/**
 * Finds first frame in the callstack that matches provided file.
 * Constructs location object from that frame.
 *
 * Example:
 * Calling getLocationInFile('file-3.js');
 * Call stack:
 * - at <anonymous> (file-1.js:1:2)
 * - at myFunction2 (file-2.js:3:4)
 * - at myFunction3 (file-3.js:5:6)
 * - at myFunction4 (file-4.js:7:8)
 *
 * Returned value: { file: 'file-3.js', line: 5, column: 6 }
 */
export declare function getLocationInFile(absFilePath: string): PlaywrightLocation;
/**
 * Returns location of function call <offset> stack frames upper.
 */
export declare function getLocationByOffset(offset: number): PlaywrightLocation;
//# sourceMappingURL=getLocationInFile.d.ts.map