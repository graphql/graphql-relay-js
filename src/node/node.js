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
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';

import type {
  GraphQLFieldConfig,
  GraphQLObjectType,
  GraphQLResolveInfo
} from 'graphql';

import {
  base64,
  unbase64
} from '../utils/base64.js';

type GraphQLNodeDefinitions = {
  nodeInterface: GraphQLInterfaceType,
  nodeField: GraphQLFieldConfig
}

type typeResolverFn = (object: any) => ?GraphQLObjectType |
                      (object: any) => ?Promise<GraphQLObjectType>;

/**
 * Given a function to map from an ID to an underlying object, and a function
 * to map from an underlying object to the concrete GraphQLObjectType it
 * corresponds to, constructs a `Node` interface that objects can implement,
 * and a field config for a `node` root field.
 *
 * If the typeResolver is omitted, object resolution on the interface will be
 * handled with the `isTypeOf` method on object types, as with any GraphQL
 * interface without a provided `resolveType` method.
 */
export function nodeDefinitions(
  idFetcher: ((id: string, info: GraphQLResolveInfo) => any),
  typeResolver?: ?typeResolverFn
): GraphQLNodeDefinitions {
  var nodeInterface = new GraphQLInterfaceType({
    name: 'Node',
    description: 'An object with an ID',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the object.',
      },
    }),
    resolveType: typeResolver
  });

  var nodeField = {
    name: 'node',
    description: 'Fetches an object given its ID',
    type: nodeInterface,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The ID of an object'
      }
    },
    resolve: (obj, {id}, info) => idFetcher(id, info)
  };

  return {nodeInterface, nodeField};
}

type ResolvedGlobalId = {
  type: string,
  id: string
}

/**
 * Takes a type name and an ID specific to that type name, and returns a
 * "global ID" that is unique among all types.
 */
export function toGlobalId(type: string, id: string): string {
  return base64([type, id].join(':'));
}

/**
 * Takes the "global ID" created by toGlobalID, and returns the type name and ID
 * used to create it.
 */
export function fromGlobalId(globalId: string): ResolvedGlobalId {
  var unbasedGlobalId = unbase64(globalId);
  var delimiterPos = unbasedGlobalId.indexOf(':');
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1)
  };
}

/**
 * Creates the configuration for an id field on a node, using `toGlobalId` to
 * construct the ID from the provided typename. The type-specific ID is fetched
 * by calling idFetcher on the object, or if not provided, by accessing the `id`
 * property on the object.
 */
export function globalIdField(
  typeName: string,
  idFetcher?: (object: any) => string
): GraphQLFieldConfig {
  return {
    name: 'id',
    description: 'The ID of an object',
    type: new GraphQLNonNull(GraphQLID),
    resolve: (obj) => toGlobalId(typeName, idFetcher ? idFetcher(obj) : obj.id)
  };
}
