import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  getNamedType,
  resolveObjMapThunk,
} from 'graphql';

import type {
  GraphQLNamedOutputType,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  ThunkObjMap,
} from 'graphql';

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with forward pagination.
 */
export const forwardConnectionArgs: GraphQLFieldConfigArgumentMap =
  Object.freeze({
    after: {
      type: GraphQLString,
      description:
        'Returns the items in the list that come after the specified cursor.',
    },
    first: {
      type: GraphQLInt,
      description: 'Returns the first n items from the list.',
    },
  });

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with backward pagination.
 */
export const backwardConnectionArgs: GraphQLFieldConfigArgumentMap =
  Object.freeze({
    before: {
      type: GraphQLString,
      description:
        'Returns the items in the list that come before the specified cursor.',
    },
    last: {
      type: GraphQLInt,
      description: 'Returns the last n items from the list.',
    },
  });

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with bidirectional pagination.
 */
export const connectionArgs: GraphQLFieldConfigArgumentMap = {
  ...forwardConnectionArgs,
  ...backwardConnectionArgs,
};

/**
 * A type alias for cursors in this implementation.
 */
export type ConnectionCursor = string;

/**
 * A type describing the arguments a connection field receives in GraphQL.
 */
export interface ConnectionArguments {
  before?: ConnectionCursor | null;
  after?: ConnectionCursor | null;
  first?: number | null;
  last?: number | null;
}

export interface ConnectionConfig {
  name?: string;
  nodeType: GraphQLNamedOutputType | GraphQLNonNull<GraphQLNamedOutputType>;
  resolveNode?: GraphQLFieldResolver<any, any>;
  resolveCursor?: GraphQLFieldResolver<any, any>;
  edgeFields?: ThunkObjMap<GraphQLFieldConfig<any, any>>;
  connectionFields?: ThunkObjMap<GraphQLFieldConfig<any, any>>;
}

export interface GraphQLConnectionDefinitions {
  edgeType: GraphQLObjectType;
  connectionType: GraphQLObjectType;
}

/**
 * Returns a GraphQLObjectType for a connection with the given name,
 * and whose nodes are of the specified type.
 */
export function connectionDefinitions(
  config: ConnectionConfig,
): GraphQLConnectionDefinitions {
  const { nodeType } = config;
  const name = config.name ?? getNamedType(nodeType).name;
  const edgeType = new GraphQLObjectType({
    name: name + 'Edge',
    description: 'An edge in a connection.',
    fields: () => ({
      node: {
        type: nodeType,
        resolve: config.resolveNode,
        description: 'The item at the end of the edge',
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: config.resolveCursor,
        description: 'A cursor for use in pagination',
      },
      ...resolveObjMapThunk(config.edgeFields ?? {}),
    }),
  });

  const connectionType = new GraphQLObjectType({
    name: name + 'Connection',
    description: 'A connection to a list of items.',
    fields: () => ({
      pageInfo: {
        type: new GraphQLNonNull(pageInfoType),
        description: 'Information to aid in pagination.',
      },
      edges: {
        type: new GraphQLList(edgeType),
        description: 'A list of edges.',
      },
      ...resolveObjMapThunk(config.connectionFields ?? {}),
    }),
  });

  return { edgeType, connectionType };
}

/**
 * A type designed to be exposed as a `Connection` over GraphQL.
 */
export interface Connection<T> {
  edges: Array<Edge<T>>;
  pageInfo: PageInfo;
}

/**
 * A type designed to be exposed as a `Edge` over GraphQL.
 */
export interface Edge<T> {
  node: T;
  cursor: ConnectionCursor;
}

/**
 * The common page info type used by all connections.
 */
const pageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: () => ({
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating forwards, are there more items?',
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating backwards, are there more items?',
    },
    startCursor: {
      type: GraphQLString,
      description: 'When paginating backwards, the cursor to continue.',
    },
    endCursor: {
      type: GraphQLString,
      description: 'When paginating forwards, the cursor to continue.',
    },
  }),
});

/**
 * A type designed to be exposed as `PageInfo` over GraphQL.
 */
export interface PageInfo {
  startCursor: ConnectionCursor | null;
  endCursor: ConnectionCursor | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
