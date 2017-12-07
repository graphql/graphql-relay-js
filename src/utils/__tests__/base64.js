/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  base64,
  unbase64
} from '../base64';

const exampleUtf8 = 'Some examples: ❤😀';
const exampleBase64 = 'U29tZSBleGFtcGxlczog4p2k8J+YgA==';

describe('base64 conversion', () => {
  it('converts from utf-8 to base64', () => {
    expect(base64(exampleUtf8)).to.equal(exampleBase64);
  });

  it('converts from base64 to utf-8', () => {
    expect(unbase64(exampleBase64)).to.equal(exampleUtf8);
  });
});
