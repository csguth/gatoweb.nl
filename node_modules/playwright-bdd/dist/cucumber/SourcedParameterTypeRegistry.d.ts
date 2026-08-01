/**
 * SourcedParameterTypeRegistry: the same as ParameterTypeRegistry, but stores location of each arameter type.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/support_code_library_builder/sourced_parameter_type_registry.ts
 */
import { ParameterType, ParameterTypeRegistry } from '@cucumber/cucumber-expressions';
interface ILineAndUri {
    line: number;
    uri: string;
}
export declare class SourcedParameterTypeRegistry extends ParameterTypeRegistry {
    private parameterTypeToSource;
    defineSourcedParameterType(parameterType: ParameterType<unknown>, source: ILineAndUri): void;
    lookupSource(parameterType: ParameterType<unknown>): ILineAndUri | undefined;
}
export {};
//# sourceMappingURL=SourcedParameterTypeRegistry.d.ts.map