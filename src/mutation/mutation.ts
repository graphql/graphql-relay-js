import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import type {
  GraphQLFieldConfig,
  GraphQLInputFieldConfigMap,
  GraphQLFieldConfigMap,
  GraphQLResolveInfo,
  Thunk,
} from 'graphql';

type MutationFn = (object: any, ctx: any, info: GraphQLResolveInfo) => mixed;

function resolveMaybeThunk<T>(thingOrThunk: Thunk<T>): T {
  return typeof thingOrThunk === 'function'
    ? // $FlowFixMe[incompatible-use] - if it's a function, we assume a thunk without arguments
      thingOrThunk()
    : thingOrThunk;
}

/**
 * A description of a mutation consumable by mutationWithClientMutationId
 * to create a GraphQLFieldConfig for that mutation.
 *
 * The inputFields and outputFields should not include `clientMutationId`,
 * as this will be provided automatically.
 *
 * An input object will be created containing the input fields, and an
 * object will be created containing the output fields.
 *
 * mutateAndGetPayload will receive an Object with a key for each
 * input field, and it should return an Object with a key for each
 * output field. It may return synchronously, or return a Promise.
 */
type MutationConfig = {
  name: string,
  description?: string,
  deprecationReason?: string,
  extensions?: { [name: string]: mixed },
  inputFields: Thunk<GraphQLInputFieldConfigMap>,
  outputFields: Thunk<GraphQLFieldConfigMap<any, any>>,
  mutateAndGetPayload: MutationFn,
};

/**
 * Returns a GraphQLFieldConfig for the mutation described by the
 * provided MutationConfig.
 */
export function mutationWithClientMutationId(
  config: MutationConfig,
): GraphQLFieldConfig<mixed, mixed> {
  const { name, inputFields, outputFields, mutateAndGetPayload } = config;
  const augmentedInputFields = () => ({
    ...resolveMaybeThunk(inputFields),
    clientMutationId: {
      type: GraphQLString,
    },
  });
  const augmentedOutputFields = () => ({
    ...resolveMaybeThunk(outputFields),
    clientMutationId: {
      type: GraphQLString,
    },
  });

  const outputType = new GraphQLObjectType({
    name: name + 'Payload',
    fields: augmentedOutputFields,
  });

  const inputType = new GraphQLInputObjectType({
    name: name + 'Input',
    fields: augmentedInputFields,
  });

  return {
    type: outputType,
    description: config.description,
    deprecationReason: config.deprecationReason,
    extensions: config.extensions,
    args: {
      input: { type: new GraphQLNonNull(inputType) },
    },
    resolve: (_, { input }, context, info) => {
      const { clientMutationId } = input;
      const payload = mutateAndGetPayload(input, context, info);
      if (isPromiseLike(payload)) {
        return payload.then(injectClientMutationId);
      }
      return injectClientMutationId(payload);

      function injectClientMutationId(data: mixed) {
        if (typeof data === 'object' && data !== null) {
          // $FlowFixMe[cannot-write] It's bad idea to mutate data but we need to pass clientMutationId somehow. Maybe in future we figure out better solution satisfying all our test cases.
          data.clientMutationId = clientMutationId;
        }

        return data;
      }
    },
  };
}

// FIXME: Temporary until graphql-js resolves this issue
// See, https://github.com/graphql/graphql-js/pull/3243#issuecomment-919510590
declare function isPromiseLike(value: mixed): boolean %checks(value instanceof
  Promise);

// eslint-disable-next-line no-redeclare
function isPromiseLike(value) {
  return typeof value?.then === 'function';
}
