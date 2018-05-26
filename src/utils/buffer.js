/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * This file exists to work around an issue with importing Buffer across
 * Webpack and Node.
 *
 * Webpack (tested with 4.5.0) doesn't currently support use of Node globals,
 * such as Buffer, in ES modules.
 * See https://github.com/webpack/webpack/issues/7032
 *
 * Hence we want to import it explicitly e.g.
 *
 * import { Buffer } from 'buffer';
 *
 * But Node (tested with version 9.11.1 and --experimental-modules) only has
 * Buffer as a property of the default export, not as a separate named export.
 */

import NodeBuffer from 'buffer';

/**
 * An alias for Node's Buffer class.
 */

export const Buffer = NodeBuffer.Buffer;
