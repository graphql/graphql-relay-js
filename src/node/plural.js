// @flow strict

import { GraphQLList, GraphQLNonNull, isNonNullType } from 'graphql';

import type {
  GraphQLFieldConfig,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLResolveInfo,
} from 'graphql';

type PluralIdentifyingRootFieldConfig = {
  argName: string,
  inputType: GraphQLInputType,
  outputType: GraphQLOutputType,
  resolveSingleInput: (
    input: any,
    context: any,
    info: GraphQLResolveInfo,
  ) => any,
  description?: string,
};

export function pluralIdentifyingRootField(
  config: PluralIdentifyingRootFieldConfig,
): GraphQLFieldConfig<mixed, mixed> {
  let inputType = config.inputType;
  if (isNonNullType(inputType)) {
    inputType = inputType.ofType;
  }
  return {
    description: config.description,
    type: new GraphQLList(config.outputType),
    args: {
      [config.argName]: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(inputType)),
        ),
      },
    },
    resolve(_obj, args, context, info) {
      const inputs = args[config.argName];
      return inputs.map((input) =>
        config.resolveSingleInput(input, context, info),
      );
    },
  };
}
