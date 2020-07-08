import type {
  GraphQLFieldConfig,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLResolveInfo,
} from 'graphql';

export interface PluralIdentifyingRootFieldConfig {
  argName: string;
  inputType: GraphQLInputType;
  outputType: GraphQLOutputType;
  resolveSingleInput(input: any, context: any, info: GraphQLResolveInfo): any;
  description?: string;
}

export function pluralIdentifyingRootField(
  config: PluralIdentifyingRootFieldConfig,
): GraphQLFieldConfig<any, any>;
