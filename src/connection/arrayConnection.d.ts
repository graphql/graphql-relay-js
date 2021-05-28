import type {
  Connection,
  ConnectionArguments,
  ConnectionCursor,
} from './connection';

// TS_SPECIFIC: This type is only exported by TypeScript
export interface ArraySliceMetaInfo {
  sliceStart: number;
  arrayLength: number;
}

/**
 * A simple function that accepts an array and connection arguments, and returns
 * a connection object for use in GraphQL. It uses array offsets as pagination,
 * so pagination will only work if the array is static.
 */
export function connectionFromArray<T>(
  data: ReadonlyArray<T>,
  args: ConnectionArguments,
): Connection<T>;

/**
 * A version of `connectionFromArray` that takes a promised array, and returns a
 * promised connection.
 */
export function connectionFromPromisedArray<T>(
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
export function connectionFromArraySlice<T>(
  arraySlice: ReadonlyArray<T>,
  args: ConnectionArguments,
  meta: ArraySliceMetaInfo,
): Connection<T>;

/**
 * A version of `connectionFromArraySlice` that takes a promised array slice,
 * and returns a promised connection.
 */
export function connectionFromPromisedArraySlice<T>(
  dataPromise: Promise<ReadonlyArray<T>>,
  args: ConnectionArguments,
  arrayInfo: ArraySliceMetaInfo,
): Promise<Connection<T>>;

/**
 * Creates the cursor string from an offset.
 */
export function offsetToCursor(offset: number): ConnectionCursor;

/**
 * Extracts the offset from the cursor string.
 */
export function cursorToOffset(cursor: ConnectionCursor): number;

/**
 * Return the cursor associated with an object in an array.
 */
export function cursorForObjectInConnection<T>(
  data: ReadonlyArray<T>,
  object: T,
): ConnectionCursor | null;

/**
 * Given an optional cursor and a default offset, returns the offset
 * to use; if the cursor contains a valid offset, that will be used,
 * otherwise it will be the default.
 */
export function getOffsetWithDefault(
  cursor: ConnectionCursor | null | undefined,
  defaultOffset: number,
): number;
