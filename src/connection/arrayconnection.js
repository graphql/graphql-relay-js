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
  ConnectionCursor,
} from './connectiontypes';

import {
  base64,
  unbase64,
} from '../utils/base64.js';

type ArraySliceMetaInfo = {
  sliceStart: number;
  arrayLength: number;
};

/**
 * A simple function that accepts an array and connection arguments, and returns
 * a connection object for use in GraphQL. It uses array offsets as pagination,
 * so pagination will only work if the array is static.
 */
export function connectionFromArray<T>(
  data: Array<T>,
  args: ConnectionArguments
): Connection<T> {
  return connectionFromArraySlice(
    data,
    args,
    {
      sliceStart: 0,
      arrayLength: data.length,
    }
  );
}

/**
 * A version of `connectionFromArray` that takes a promised array, and returns a
 * promised connection.
 */
export function connectionFromPromisedArray<T>(
  dataPromise: Promise<Array<T>>,
  args: ConnectionArguments
): Promise<Connection<T>> {
  return dataPromise.then(data => connectionFromArray(data, args));
}

/**
 * Given a slice (subset) of an array, returns a connection object for use in
 * GraphQL.
 *
 * This function is similar to `connectionFromArray`, but is intended for use
 * cases where you know the cardinality of the connection, consider it too large
 * to materialize the entire array, and instead wish pass in a slice of the
 * total result large enough to cover the range specified in `args`.
 */
export function connectionFromArraySlice<T>(
  arraySlice: Array<T>,
  args: ConnectionArguments,
  meta: ArraySliceMetaInfo
): Connection<T> {
  var {after, before, first, last} = args;
  var {sliceStart, arrayLength} = meta;
  var sliceEnd = sliceStart + arraySlice.length;
  var beforeOffset = getOffsetWithDefault(before, arrayLength);
  var afterOffset = getOffsetWithDefault(after, -1);

  var startOffset = Math.max(
    sliceStart - 1,
    afterOffset,
    -1
  ) + 1;
  var endOffset = Math.min(
    sliceEnd,
    beforeOffset,
    arrayLength
  );
  if (typeof first === 'number') {
    endOffset = Math.min(
      endOffset,
      startOffset + first
    );
  }
  if (typeof last === 'number') {
    startOffset = Math.max(
      startOffset,
      endOffset - last
    );
  }

  // If supplied slice is too large, trim it down before mapping over it.
  var slice = arraySlice.slice(
    Math.max(startOffset - sliceStart, 0),
    arraySlice.length - (sliceEnd - endOffset)
  );

  var edges = slice.map((value, index) => ({
    cursor: offsetToCursor(startOffset + index),
    node: value,
  }));

  var firstEdge = edges[0];
  var lastEdge = edges[edges.length - 1];
  var lowerBound = after ? (afterOffset + 1) : 0;
  var upperBound = before ? beforeOffset : arrayLength;
  return {
    edges,
    pageInfo: {
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      hasPreviousPage:
        typeof last === 'number' ? startOffset > lowerBound : false,
      hasNextPage:
        typeof first === 'number' ? endOffset < upperBound : false,
    },
  };
}

/**
 * A version of `connectionFromArraySlice` that takes a promised array slice,
 * and returns a promised connection.
 */
export function connectionFromPromisedArraySlice<T>(
  dataPromise: Promise<Array<T>>,
  args: ConnectionArguments,
  arrayInfo: ArraySliceMetaInfo
): Promise<Connection<T>> {
  return dataPromise.then(
    data => connectionFromArraySlice(data, args, arrayInfo)
  );
}

var PREFIX = 'arrayconnection:';

/**
 * Creates the cursor string from an offset.
 */
export function offsetToCursor(offset: number): ConnectionCursor {
  return base64(PREFIX + offset);
}

/**
 * Rederives the offset from the cursor string.
 */
export function cursorToOffset(cursor: ConnectionCursor): number {
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
export function getOffsetWithDefault(
  cursor?: ?ConnectionCursor,
  defaultOffset: number
): number {
  if (typeof cursor !== 'string') {
    return defaultOffset;
  }
  var offset = cursorToOffset(cursor);
  return isNaN(offset) ? defaultOffset : offset;
}
