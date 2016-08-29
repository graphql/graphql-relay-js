import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  base64,
  unbase64
} from '../base64';

var exampleUtf8 = 'Some examples: ❤😀';
var exampleBase64 = 'U29tZSBleGFtcGxlczog4p2k8J+YgA==';

describe('base64 conversion', () => {
  it('converts from utf-8 to base64', () => {
    return expect(base64(exampleUtf8)).to.equal(exampleBase64);
  });

  it('converts from base64 to utf-8', () => {
    return expect(unbase64(exampleBase64)).to.equal(exampleUtf8);
  });
});
