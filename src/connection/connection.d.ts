import type {
  GraphQLNonNull,
  GraphQLNamedType,
  GraphQLScalarType,
  GraphQLObjectType,
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  Thunk,
} from 'graphql';

// TS_SPECIFIC: This type is only exported by TypeScript. Flow uses the spread operator instead.
export interface ForwardConnectionArgs {
  after: { type: GraphQLScalarType };
  first: { type: GraphQLScalarType };
}

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with forward pagination.
 */
export const forwardConnectionArgs: GraphQLFieldConfigArgumentMap &
  ForwardConnectionArgs;

// TS_SPECIFIC: This type is only exported by TypeScript. Flow uses the spread operator instead.
export interface BackwardConnectionArgs {
  before: { type: GraphQLScalarType };
  last: { type: GraphQLScalarType };
}

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with backward pagination.
 */
export const backwardConnectionArgs: GraphQLFieldConfigArgumentMap &
  BackwardConnectionArgs;

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with bidirectional pagination.
 */
export const connectionArgs: GraphQLFieldConfigArgumentMap &
  ForwardConnectionArgs &
  BackwardConnectionArgs;

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
  nodeType: GraphQLNamedType | GraphQLNonNull<GraphQLNamedType>;
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
export function connectionDefinitions(
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
