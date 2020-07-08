// @flow strict

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

type MutationFn = (
  object: any,
  ctx: any,
  info: GraphQLResolveInfo,
) => Promise<any> | any;

function resolveMaybeThunk<T>(thingOrThunk: Thunk<T>): T {
  return typeof thingOrThunk === 'function'
    ? // $FlowFixMe - if it's a function, we assume a thunk without arguments
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
  const {
    name,
    description,
    deprecationReason,
    inputFields,
    outputFields,
    mutateAndGetPayload,
  } = config;
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
    description,
    deprecationReason,
    args: {
      input: { type: new GraphQLNonNull(inputType) },
    },
    resolve: (_, { input }, context, info) => {
      const { clientMutationId } = input;
      const payload = mutateAndGetPayload(input, context, info);
      if (isPromise(payload)) {
        return payload.then((data) => ({ ...data, clientMutationId }));
      }

      return { ...payload, clientMutationId };
    },
  };
}

function isPromise(value: any): boolean {
  return typeof value?.then === 'function';
}
