/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * An flow type alias for cursors in this implementation.
 */
export type ConnectionCursor = string;

/**
 * A flow type designed to be exposed as `PageInfo` over GraphQL.
 */
export type PageInfo = {
  startCursor: ?ConnectionCursor,
  endCursor: ?ConnectionCursor,
  hasPreviousPage: ?boolean,
  hasNextPage: ?boolean,
};

/**
 * A flow type designed to be exposed as a `Connection` over GraphQL.
 */
export type Connection<T> = {
  edges: Array<Edge<T>>,
  pageInfo: PageInfo,
};

/**
 * A flow type designed to be exposed as a `Edge` over GraphQL.
 */
export type Edge<T> = {
  node: T,
  cursor: ConnectionCursor,
};

/**
 * A flow type describing the arguments a connection field receives in GraphQL.
 */
export type ConnectionArguments = {
  before?: ?ConnectionCursor,
  after?: ?ConnectionCursor,
  first?: ?number,
  last?: ?number,
};
