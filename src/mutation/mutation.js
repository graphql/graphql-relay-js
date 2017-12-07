/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import type {
  GraphQLFieldConfig,
  GraphQLInputFieldConfigMap,
  GraphQLFieldConfigMap,
  GraphQLResolveInfo,
  Thunk,
} from 'graphql';

type mutationFn = (
  object: any,
  ctx: any,
  info: GraphQLResolveInfo
) => Promise<any> | any;

function resolveMaybeThunk<T>(thingOrThunk: Thunk<T>): T {
  return typeof thingOrThunk === 'function' ? thingOrThunk() : thingOrThunk;
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
  outputFields: Thunk<GraphQLFieldConfigMap<*, *>>,
  mutateAndGetPayload: mutationFn,
};

/**
 * Returns a GraphQLFieldConfig for the mutation described by the
 * provided MutationConfig.
 */
export function mutationWithClientMutationId(
  config: MutationConfig
): GraphQLFieldConfig<*, *> {
  const {
    name,
    description,
    deprecationReason,
    inputFields,
    outputFields,
    mutateAndGetPayload
  } = config;
  const augmentedInputFields = () => ({
    ...resolveMaybeThunk(inputFields),
    clientMutationId: {
      type: GraphQLString
    }
  });
  const augmentedOutputFields = () => ({
    ...resolveMaybeThunk(outputFields),
    clientMutationId: {
      type: GraphQLString
    }
  });

  const outputType = new GraphQLObjectType({
    name: name + 'Payload',
    fields: augmentedOutputFields
  });

  const inputType = new GraphQLInputObjectType({
    name: name + 'Input',
    fields: augmentedInputFields
  });

  return {
    type: outputType,
    description,
    deprecationReason,
    args: {
      input: {type: new GraphQLNonNull(inputType)}
    },
    resolve: (_, {input}, context, info) => {
      return Promise.resolve(mutateAndGetPayload(input, context, info))
        .then(payload => {
          payload.clientMutationId = input.clientMutationId;
          return payload;
        });
    }
  };
}
