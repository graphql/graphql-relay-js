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
  const {after, before, first, last} = args;
  const {sliceStart, arrayLength} = meta;
  const sliceEnd = sliceStart + arraySlice.length;
  const beforeOffset = getOffset(before, arrayLength);
  const afterOffset = getOffset(after, -1);

  let startOffset = Math.max(
    sliceStart - 1,
    afterOffset,
    -1
  ) + 1;
  let endOffset = Math.min(
    sliceEnd,
    beforeOffset,
    arrayLength
  );
  if (first != null) {
    endOffset = Math.min(
      endOffset,
      startOffset + first
    );
  }
  if (last != null) {
    startOffset = Math.max(
      startOffset,
      endOffset - last
    );
  }

  // If supplied slice is too large, trim it down before mapping over it.
  let slice = arraySlice;
  if (sliceStart < startOffset || sliceEnd > endOffset) {
    slice = arraySlice.slice(
      Math.max(startOffset, sliceStart),
      Math.min(endOffset, sliceEnd)
    );
  }

  const edges = slice.map((value, index) => ({
    cursor: offsetToCursor(startOffset + index),
    node: value,
  }));

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];
  const lowerBound = after ? (afterOffset + 1) : 0;
  const upperBound = before ? beforeOffset : arrayLength;
  return {
    edges,
    pageInfo: {
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      hasPreviousPage: last != null ? startOffset > lowerBound : false,
      hasNextPage: first != null ? endOffset < upperBound : false,
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
function offsetToCursor(offset: number): ConnectionCursor {
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
function getOffset(cursor?: ?ConnectionCursor, defaultOffset: number): number {
  if (cursor == null) {
    return defaultOffset;
  }
  var offset = cursorToOffset(cursor);
  return isNaN(offset) ? defaultOffset : offset;
}
