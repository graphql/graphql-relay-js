/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import type {
  Connection,
  ConnectionArguments,
  ConnectionCursor
} from './connectiontypes';

import {
  base64,
  unbase64
} from '../utils/base64.js';

/**
 * A simple function that accepts an array and connection arguments, and returns
 * a connection object for use in GraphQL. It uses array offsets as pagination,
 * so pagination will only work if the array is static.
 */
export function connectionFromArray<T>(
  data: Array<T>,
  args: ConnectionArguments
): Connection<T> {
  var edges = data.map(
    (value, index) => {
      return {cursor: offsetToCursor(index), node: value};
    }
  );
  var {before, after, first, last} = args;

  // Slice with cursors
  var begin = Math.max(getOffset(after, -1), -1) + 1;
  var end = Math.min(getOffset(before, edges.length + 1), edges.length + 1);
  edges = edges.slice(begin, end);
  if (edges.length === 0) {
    return emptyConnection();
  }

  // Save the pre-slice cursors
  var firstPresliceCursor = edges[0].cursor;
  var lastPresliceCursor = edges[edges.length - 1].cursor;

  // Slice with limits
  if (first !== null && first !== undefined) {
    edges = edges.slice(0, first);
  }
  if (last !== null && last !== undefined) {
    edges = edges.slice(-last);
  }
  if (edges.length === 0) {
    return emptyConnection();
  }

  // Construct the connection
  var firstEdge = edges[0];
  var lastEdge = edges[edges.length - 1];
  return {
    edges: edges,
    pageInfo: {
      startCursor: firstEdge.cursor,
      endCursor: lastEdge.cursor,
      hasPreviousPage: (firstEdge.cursor !== firstPresliceCursor),
      hasNextPage: (lastEdge.cursor !== lastPresliceCursor)
    }
  };
}

/**
 * A version of the above that takes a promised array, and returns a promised
 * connection.
 */
export function connectionFromPromisedArray<T>(
  dataPromise: Promise<Array<T>>,
  args: ConnectionArguments
): Promise<Connection<T>> {
  return dataPromise.then(data => connectionFromArray(data, args));
}

/**
 * Helper to get an empty connection.
 */
function emptyConnection<T>(): Connection<T> {
  return {
    edges: [],
    pageInfo: {
      startCursor: null,
      endCursor: null,
      hasPreviousPage: false,
      hasNextPage: false
    }
  };
}

var PREFIX = 'arrayconnection:';

/**
 * Creates the cursor string from an offset.
 */
function offsetToCursor(offset: number): ConnectionCursor {
  return base64(PREFIX + offset);
}

/**
 * Rederives the offset from the cursor string.
 */
function cursorToOffset(cursor: ConnectionCursor): number {
  return parseInt(unbase64(cursor).substring(PREFIX.length), 10);
}

/**
 * Return the cursor associated with an object in an array.
 */
export function cursorForObjectInConnection<T>(
  data: Array<T>,
  object: T
): ?ConnectionCursor {
  var offset = data.indexOf(object);
  if (offset === -1) {
    return null;
  }
  return offsetToCursor(offset);
}

/**
 * Given an optional cursor and a default offset, returns the offset
 * to use; if the cursor contains a valid offset, that will be used,
 * otherwise it will be the default.
 */
function getOffset(cursor?: ?ConnectionCursor, defaultOffset: number): number {
  if (cursor === undefined || cursor === null) {
    return defaultOffset;
  }
  var offset = cursorToOffset(cursor);
  if (isNaN(offset)) {
    return defaultOffset;
  }
  return offset;
}

