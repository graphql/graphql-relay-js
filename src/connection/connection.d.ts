import type {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLScalarType,
  Thunk,
} from 'graphql';

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with forward pagination.
 */
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

/**
 * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
 * whose return type is a connection type with backward pagination.
 */
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

export type ConnectionConfigNodeTypeNullable =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType;

export type ConnectionConfigNodeType =
  | ConnectionConfigNodeTypeNullable
  | GraphQLNonNull<ConnectionConfigNodeTypeNullable>;

export interface ConnectionConfig {
  name?: string | null;
  nodeType: ConnectionConfigNodeType;
  resolveNode?: GraphQLFieldResolver<any, any> | null;
  resolveCursor?: GraphQLFieldResolver<any, any> | null;
  edgeFields?: Thunk<GraphQLFieldConfigMap<any, any>> | null;
  connectionFields?: Thunk<GraphQLFieldConfigMap<any, any>> | null;
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
