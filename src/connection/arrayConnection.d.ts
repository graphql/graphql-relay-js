import type {
  Connection,
  ConnectionArguments,
  ConnectionCursor,
} from './connection';

interface ArraySliceMetaInfo {
  sliceStart: number;
  arrayLength: number;
}

/**
 * A simple function that accepts an array and connection arguments, and returns
 * a connection object for use in GraphQL. It uses array offsets as pagination,
 * so pagination will only work if the array is static.
 */
export declare function connectionFromArray<T>(
  data: ReadonlyArray<T>,
  args: ConnectionArguments,
): Connection<T>;

/**
 * A version of `connectionFromArray` that takes a promised array, and returns a
 * promised connection.
 */
export declare function connectionFromPromisedArray<T>(
  dataPromise: Promise<ReadonlyArray<T>>,
  args: ConnectionArguments,
): Promise<Connection<T>>;

/**
 * Given a slice (subset) of an array, returns a connection object for use in
 * GraphQL.
 *
 * This function is similar to `connectionFromArray`, but is intended for use
 * cases where you know the cardinality of the connection, consider it too large
 * to materialize the entire array, and instead wish pass in a slice of the
 * total result large enough to cover the range specified in `args`.
 */
export declare function connectionFromArraySlice<T>(
  arraySlice: ReadonlyArray<T>,
  args: ConnectionArguments,
  meta: ArraySliceMetaInfo,
): Connection<T>;

/**
 * A version of `connectionFromArraySlice` that takes a promised array slice,
 * and returns a promised connection.
 */
export declare function connectionFromPromisedArraySlice<T>(
  dataPromise: Promise<ReadonlyArray<T>>,
  args: ConnectionArguments,
  arrayInfo: ArraySliceMetaInfo,
): Promise<Connection<T>>;

/**
 * Creates the cursor string from an offset.
 */
export declare function offsetToCursor(offset: number): ConnectionCursor;

/**
 * Extracts the offset from the cursor string.
 */
export declare function cursorToOffset(cursor: ConnectionCursor): number;

/**
 * Return the cursor associated with an object in an array.
 */
export declare function cursorForObjectInConnection<T>(
  data: ReadonlyArray<T>,
  object: T,
): ConnectionCursor | null;

/**
 * Given an optional cursor and a default offset, returns the offset
 * to use; if the cursor contains a valid offset, that will be used,
 * otherwise it will be the default.
 */
export declare function getOffsetWithDefault(
  cursor: ConnectionCursor | null | undefined,
  defaultOffset: number,
): number;
