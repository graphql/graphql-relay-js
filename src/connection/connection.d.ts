import type {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLScalarType,
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

export interface ConnectionConfig {
  name?: string;
  nodeType: GraphQLObjectType;
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
