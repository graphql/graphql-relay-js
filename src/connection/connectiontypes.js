// @flow strict

/**
 * An flow type alias for cursors in this implementation.
 */
export type ConnectionCursor = string;

/**
 * A flow type designed to be exposed as `PageInfo` over GraphQL.
 */
export type PageInfo = {|
  startCursor: ConnectionCursor | null,
  endCursor: ConnectionCursor | null,
  hasPreviousPage: boolean,
  hasNextPage: boolean,
|};

/**
 * A flow type designed to be exposed as a `Connection` over GraphQL.
 */
export type Connection<T> = {|
  edges: Array<Edge<T>>,
  pageInfo: PageInfo,
|};

/**
 * A flow type designed to be exposed as a `Edge` over GraphQL.
 */
export type Edge<T> = {|
  node: T,
  cursor: ConnectionCursor,
|};

/**
 * A flow type describing the arguments a connection field receives in GraphQL.
 */
export type ConnectionArguments = {
  before?: ConnectionCursor | null,
  after?: ConnectionCursor | null,
  first?: number | null,
  last?: number | null,
  ...
};
