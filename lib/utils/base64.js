'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.base64 = base64;
exports.unbase64 = unbase64;
function base64(i) {
  return Buffer.from(i, 'utf8').toString('base64');
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

function unbase64(i) {
  return Buffer.from(i, 'base64').toString('utf8');
}