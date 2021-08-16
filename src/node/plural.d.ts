import type {
  GraphQLFieldConfig,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLResolveInfo,
} from 'graphql';

interface PluralIdentifyingRootFieldConfig {
  argName: string;
  inputType: GraphQLInputType;
  outputType: GraphQLOutputType;
  resolveSingleInput: (
    input: any,
    context: any,
    info: GraphQLResolveInfo,
  ) => unknown;
  description?: string;
}

export function pluralIdentifyingRootField(
  config: PluralIdentifyingRootFieldConfig,
): GraphQLFieldConfig<any, any>;
