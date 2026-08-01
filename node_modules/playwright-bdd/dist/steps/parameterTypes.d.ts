import { SourcedParameterTypeRegistry } from '../cucumber/SourcedParameterTypeRegistry';
export declare const parameterTypeRegistry: SourcedParameterTypeRegistry;
export interface IParameterTypeDefinition<T> {
    name: string;
    regexp: readonly RegExp[] | readonly string[] | RegExp | string;
    transformer?: (...match: string[]) => T;
    useForSnippets?: boolean;
    preferForRegexpMatch?: boolean;
}
export declare function defineParameterType<T>(options: IParameterTypeDefinition<T>): void;
//# sourceMappingURL=parameterTypes.d.ts.map