import { Writable } from 'node:stream';
import { TestStepResultStatus } from '@cucumber/messages';
type IColorFn = (text: string) => string;
export interface IColorFns {
    forStatus: (status: TestStepResultStatus) => IColorFn;
    location: IColorFn;
    tag: IColorFn;
    diffAdded: IColorFn;
    diffRemoved: IColorFn;
    errorMessage: IColorFn;
    errorStack: IColorFn;
}
export default function getColorFns(_stream: Writable, _env: NodeJS.ProcessEnv, _enabled?: boolean): IColorFns;
export {};
//# sourceMappingURL=getColorFns.d.ts.map