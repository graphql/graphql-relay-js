import type {
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLNamedOutputType,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  Thunk,
} from 'graphql';

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with forward pagination.
 */
export declare const forwardConnectionArgs: GraphQLFieldConfigArgumentMap;

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with backward pagination.
 */
export declare const backwardConnectionArgs: GraphQLFieldConfigArgumentMap;

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with bidirectional pagination.
 */
export declare const connectionArgs: GraphQLFieldConfigArgumentMap;

/**
 * A type alias for cursors in this implementation.
 */
export declare type ConnectionCursor = string;

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
  edgeFields?: Thunk<GraphQLFieldConfigMap<any, any>>;
  connectionFields?: Thunk<GraphQLFieldConfigMap<any, any>>;
}

export interface GraphQLConnectionDefinitions {
  edgeType: GraphQLObjectType;
  connectionType: GraphQLObjectType;
}

/**
 * Returns a GraphQLObjectType for a connection with the given name,
 * and whose nodes are of the specified type.
 */
export declare function connectionDefinitions(
  config: ConnectionConfig,
): GraphQLConnectionDefinitions;

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
 * A type designed to be exposed as `PageInfo` over GraphQL.
 */
export interface PageInfo {
  startCursor: ConnectionCursor | null;
  endCursor: ConnectionCursor | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
