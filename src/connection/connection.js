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
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import type {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap
} from 'graphql';

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with forward pagination.
 */
export var forwardConnectionArgs: GraphQLFieldConfigArgumentMap = {
  after: {
    type: GraphQLString
  },
  first: {
    type: GraphQLInt
  },
};

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with backward pagination.
 */
export var backwardConnectionArgs: GraphQLFieldConfigArgumentMap = {
  before: {
    type: GraphQLString
  },
  last: {
    type: GraphQLInt
  },
};

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with bidirectional pagination.
 */
export var connectionArgs: GraphQLFieldConfigArgumentMap = {
  ...forwardConnectionArgs,
  ...backwardConnectionArgs,
};

type ConnectionConfig = {
  name?: ?string,
  nodeType: GraphQLObjectType,
  resolveNode?: ?Function,
  resolveCursor?: ?Function,
  edgeFields?: ?(() => GraphQLFieldConfigMap) | ?GraphQLFieldConfigMap,
  connectionFields?: ?(() => GraphQLFieldConfigMap) | ?GraphQLFieldConfigMap,
}

type GraphQLConnectionDefinitions = {
  edgeType: GraphQLObjectType,
  connectionType: GraphQLObjectType
}

function resolveMaybeThunk<T>(thingOrThunk: T | () => T): T {
  return typeof thingOrThunk === 'function' ? thingOrThunk() : thingOrThunk;
}

/**
 * Returns a GraphQLObjectType for a connection with the given name,
 * and whose nodes are of the specified type.
 */
export function connectionDefinitions(
  config: ConnectionConfig
): GraphQLConnectionDefinitions {
  var {nodeType} = config;
  var name = config.name || nodeType.name;
  var edgeFields = config.edgeFields || {};
  var connectionFields = config.connectionFields || {};
  var resolveNode = config.resolveNode;
  var resolveCursor = config.resolveCursor;
  var edgeType = new GraphQLObjectType({
    name: name + 'Edge',
    description: 'An edge in a connection.',
    fields: () => ({
      node: {
        type: nodeType,
        resolve: resolveNode,
        description: 'The item at the end of the edge',
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: resolveCursor,
        description: 'A cursor for use in pagination'
      },
      ...(resolveMaybeThunk(edgeFields): any)
    }),
  });
  edgeType.ofType = nodeType;

  var connectionType = new GraphQLObjectType({
    name: name + 'Connection',
    description: 'A connection to a list of items.',
    fields: () => ({
      pageInfo: {
        type: new GraphQLNonNull(pageInfoType),
        description: 'Information to aid in pagination.'
      },
      edges: {
        type: new GraphQLList(edgeType),
        description: 'A list of edges.'
      },
      ...(resolveMaybeThunk(connectionFields): any)
    }),
  });
  connectionType.ofType = nodeType;

  return {edgeType, connectionType};
}

/**
 * The common page info type used by all connections.
 */
var pageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: () => ({
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating forwards, are there more items?'
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating backwards, are there more items?'
    },
    startCursor: {
      type: GraphQLString,
      description: 'When paginating backwards, the cursor to continue.'
    },
    endCursor: {
      type: GraphQLString,
      description: 'When paginating forwards, the cursor to continue.'
    },
  })
});
