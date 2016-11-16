/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

export type Base64String = string;

export function base64(i: string): Base64String {
  return new Buffer(i, 'utf8').toString('base64');
}

export function unbase64(i: Base64String): string {
  return new Buffer(i, 'base64').toString('utf8');
}
