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
  connectionFromArray,
  cursorForObjectInConnection,
} from '../arrayconnection';

var letters = ['A', 'B', 'C', 'D', 'E'];
describe('connectionFromArray', () => {
  describe('Handles basic slicing', () => {
    it('Returns all elements without filters', () => {
      var c = connectionFromArray(letters, {});
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

    it('Respects a smaller first', () => {
      var c = connectionFromArray(letters, {first: 2});
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

    it('Respects an overly large first', () => {
      var c = connectionFromArray(letters, {first: 10});
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

    it('Respects a smaller last', () => {
      var c = connectionFromArray(letters, {last: 2});
      return expect(c).to.deep.equal({
        edges: [
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
          startCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
          hasPreviousPage: true,
          hasNextPage: false,
        }
      });
    });

    it('Respects an overly large last', () => {
      var c = connectionFromArray(letters, {last: 10});
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
  });

  describe('Handles pagination', () => {
    it('Respects first and after', () => {
      var c = connectionFromArray(
        letters,
        {first: 2, after: 'YXJyYXljb25uZWN0aW9uOjE='}
      );
      return expect(c).to.deep.equal({
        edges: [
          {
            node: 'C',
            cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          },
          {
            node: 'D',
            cursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          },
        ],
        pageInfo: {
          startCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          hasPreviousPage: false,
          hasNextPage: true,
        }
      });
    });

    it('Respects first and after with long first', () => {
      var c = connectionFromArray(
        letters,
        {first: 10, after: 'YXJyYXljb25uZWN0aW9uOjE='}
      );
      return expect(c).to.deep.equal({
        edges: [
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
          startCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
          hasPreviousPage: false,
          hasNextPage: false,
        }
      });
    });

    it('Respects last and before', () => {
      var c = connectionFromArray(
        letters,
        {last: 2, before: 'YXJyYXljb25uZWN0aW9uOjM='}
      );
      return expect(c).to.deep.equal({
        edges: [
          {
            node: 'B',
            cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          },
          {
            node: 'C',
            cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          },
        ],
        pageInfo: {
          startCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          hasPreviousPage: true,
          hasNextPage: false,
        }
      });
    });

    it('Respects last and before with long last', () => {
      var c = connectionFromArray(
        letters,
        {last: 10, before: 'YXJyYXljb25uZWN0aW9uOjM='}
      );
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
        ],
        pageInfo: {
          startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          hasPreviousPage: false,
          hasNextPage: false,
        }
      });
    });

    it('Respects first and after and before, too few', () => {
      var c = connectionFromArray(
        letters,
        {
          first: 2,
          after: 'YXJyYXljb25uZWN0aW9uOjA=',
          before: 'YXJyYXljb25uZWN0aW9uOjQ='
        }
      );
      return expect(c).to.deep.equal({
        edges: [
          {
            node: 'B',
            cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          },
          {
            node: 'C',
            cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          },
        ],
        pageInfo: {
          startCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          hasPreviousPage: false,
          hasNextPage: true,
        }
      });
    });

    it('Respects first and after and before, too many', () => {
      var c = connectionFromArray(
        letters,
        {
          first: 4,
          after: 'YXJyYXljb25uZWN0aW9uOjA=',
          before: 'YXJyYXljb25uZWN0aW9uOjQ='
        }
      );
      return expect(c).to.deep.equal({
        edges: [
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
        ],
        pageInfo: {
          startCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          hasPreviousPage: false,
          hasNextPage: false,
        }
      });
    });

    it('Respects first and after and before, exactly right', () => {
      var c = connectionFromArray(
        letters,
        {
          first: 3,
          after: 'YXJyYXljb25uZWN0aW9uOjA=',
          before: 'YXJyYXljb25uZWN0aW9uOjQ='
        }
      );
      return expect(c).to.deep.equal({
        edges: [
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
        ],
        pageInfo: {
          startCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          hasPreviousPage: false,
          hasNextPage: false,
        }
      });
    });

    it('Respects last and after and before, too few', () => {
      var c = connectionFromArray(
        letters,
        {
          last: 2,
          after: 'YXJyYXljb25uZWN0aW9uOjA=',
          before: 'YXJyYXljb25uZWN0aW9uOjQ='
        }
      );
      return expect(c).to.deep.equal({
        edges: [
          {
            node: 'C',
            cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          },
          {
            node: 'D',
            cursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          },
        ],
        pageInfo: {
          startCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          hasPreviousPage: true,
          hasNextPage: false,
        }
      });
    });

    it('Respects last and after and before, too many', () => {
      var c = connectionFromArray(
        letters,
        {
          last: 3,
          after: 'YXJyYXljb25uZWN0aW9uOjA=',
          before: 'YXJyYXljb25uZWN0aW9uOjQ='
        }
      );
      return expect(c).to.deep.equal({
        edges: [
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
        ],
        pageInfo: {
          startCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          hasPreviousPage: false,
          hasNextPage: false,
        }
      });
    });

    it('Respects last and after and before, exactly right', () => {
      var c = connectionFromArray(
        letters,
        {
          last: 3,
          after: 'YXJyYXljb25uZWN0aW9uOjA=',
          before: 'YXJyYXljb25uZWN0aW9uOjQ='
        }
      );
      return expect(c).to.deep.equal({
        edges: [
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
        ],
        pageInfo: {
          startCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
          hasPreviousPage: false,
          hasNextPage: false,
        }
      });
    });
  });

  describe('Handles cursor edge cases', () => {
    it('Returns all elements if cursors are invalid', () => {
      var c = connectionFromArray(
        letters,
        {before: 'invalid', after: 'invalid'}
      );
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

    it('Returns all elements if cursors are on the outside', () => {
      var c = connectionFromArray(
        letters,
        {
          before: 'YXJyYXljb25uZWN0aW9uOjYK',
          after: 'YXJyYXljb25uZWN0aW9uOi0xCg=='
        }
      );
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

    it('Returns no elements if cursors cross', () => {
      var c = connectionFromArray(
        letters,
        {before: 'YXJyYXljb25uZWN0aW9uOjI=', after: 'YXJyYXljb25uZWN0aW9uOjQ='}
      );
      return expect(c).to.deep.equal({
        edges: [
        ],
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false,
        }
      });
    });
  });

  describe('cursorForObjectInConnection', () => {
    it('returns an edge\'s cursor, given an array and a member object', () => {
      var letterBCursor = cursorForObjectInConnection(letters, 'B');
      return expect(letterBCursor).to.equal('YXJyYXljb25uZWN0aW9uOjE=');
    });

    it('returns null, given an array and a non-member object', () => {
      var letterFCursor = cursorForObjectInConnection(letters, 'F');
      return expect(letterFCursor).to.be.null;
    });
  });
});
