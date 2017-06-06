/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
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

type runAfterMutationFn = (
  object: any,
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
 * mutateAndGetPayload will receieve an Object with a key for each
 * input field, and it should return an Object with a key for each
 * output field. It may return synchronously, or return a Promise.
 * 
 * runAfterMutation will resolve with the payload from the resolved
 * mutateAndGetPayload. Example usage may be to save the payload to
 * an in memory database.
 */
type MutationConfig = {
  name: string,
  description?: string,
  deprecationReason?: string,
  inputFields: Thunk<GraphQLInputFieldConfigMap>,
  outputFields: Thunk<GraphQLFieldConfigMap<*, *>>,
  mutateAndGetPayload: mutationFn,
  runAfterMutation: runAfterMutationFn
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
    mutateAndGetPayload,
    runAfterMutation
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
          if (runAfterMutation) {
            return Promise.resolve(runAfterMutation(payload)).then(() => payload);
          }
          return payload;
        });
    }
  };
}
