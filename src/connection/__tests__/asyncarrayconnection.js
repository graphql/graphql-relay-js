/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  connectionFromPromisedArray
} from '../arrayconnection';

var letters = Promise.resolve(['A', 'B', 'C', 'D', 'E']);
describe('connectionFromPromisedArray', () => {
  it('Returns all elements without filters', async () => {
    var c = await connectionFromPromisedArray(letters, {});
    return expect(c).to.deep.equal({
      edges: [
        {
          node: 'A',
          cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        },
        {
          node: 'B',
          cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
        },
        {
          node: 'C',
          cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
        },
        {
          node: 'D',
          cursor: 'YXJyYXljb25uZWN0aW9uOjM=',
        },
        {
          node: 'E',
          cursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
        },
      ],
      pageInfo: {
        startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
        hasPreviousPage: false,
        hasNextPage: false,
      }
    });
  });

  it('Respects a smaller first', async () => {
    var c = await connectionFromPromisedArray(letters, {first: 2});
    return expect(c).to.deep.equal({
      edges: [
        { node: 'A',
          cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        },
        {
          node: 'B',
          cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
        },
      ],
      pageInfo: {
        startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
        hasPreviousPage: false,
        hasNextPage: true,
      }
    });
  });
});
