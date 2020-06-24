// @flow strict

import { GraphQLList, GraphQLNonNull } from 'graphql';

import type {
  GraphQLFieldConfig,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLResolveInfo,
} from 'graphql';

type PluralIdentifyingRootFieldConfig = {|
  argName: string,
  inputType: GraphQLInputType,
  outputType: GraphQLOutputType,
  resolveSingleInput: (
    input: any,
    context: any,
    info: GraphQLResolveInfo,
  ) => ?any,
  description?: ?string,
|};

export function pluralIdentifyingRootField(
  config: PluralIdentifyingRootFieldConfig,
): GraphQLFieldConfig<mixed, mixed> {
  const inputArgs = {};
  let inputType = config.inputType;
  if (inputType instanceof GraphQLNonNull) {
    inputType = inputType.ofType;
  }
  inputArgs[config.argName] = {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(inputType))),
  };
  return {
    description: config.description,
    type: new GraphQLList(config.outputType),
    args: inputArgs,
    resolve(_obj, args, context, info) {
      const inputs = args[config.argName];
      return Promise.all(
        inputs.map((input) =>
          Promise.resolve(config.resolveSingleInput(input, context, info)),
        ),
      );
    },
  };
}
