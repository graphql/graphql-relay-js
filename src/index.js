/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// Flow types for creating connection types in the schema
export type {
  Connection,
  ConnectionArguments,
  ConnectionCursor,
  Edge,
  PageInfo,
} from './connection/connectiontypes.js';

// Helpers for creating connection types in the schema
export {
  backwardConnectionArgs,
  connectionArgs,
  connectionDefinitions,
  forwardConnectionArgs,
} from './connection/connection.js';

// Helpers for creating connections from arrays
export {
  connectionFromArray,
  connectionFromArraySlice,
  connectionFromPromisedArray,
  connectionFromPromisedArraySlice,
  cursorForObjectInConnection,
  cursorToOffset,
  getOffsetWithDefault,
  offsetToCursor,
} from './connection/arrayconnection.js';

// Helper for creating mutations with client mutation IDs
export {mutationWithClientMutationId} from './mutation/mutation.js';

// Helper for creating node definitions
export {nodeDefinitions} from './node/node.js';

// Helper for creating plural identifying root fields
export {pluralIdentifyingRootField} from './node/plural.js';

// Utilities for creating global IDs in systems that don't have them.
export {fromGlobalId, globalIdField, toGlobalId} from './node/node.js';
