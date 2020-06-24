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
  connectionFromArray,
  connectionFromArraySlice,
  connectionFromPromisedArray,
  connectionFromPromisedArraySlice,
  cursorForObjectInConnection,
} from '../arrayconnection';

describe('connectionFromArray()', () => {
  const letters = ['A', 'B', 'C', 'D', 'E'];

  describe('basic slicing', () => {
    it('returns all elements without filters', () => {
      const c = connectionFromArray(letters, {});
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
        },
      });
    });

    it('respects a smaller first', () => {
      const c = connectionFromArray(letters, { first: 2 });
      return expect(c).to.deep.equal({
        edges: [
          { node: 'A', cursor: 'YXJyYXljb25uZWN0aW9uOjA=' },
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
        },
      });
    });

    it('respects an overly large first', () => {
      const c = connectionFromArray(letters, { first: 10 });
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
        },
      });
    });

    it('respects a smaller last', () => {
      const c = connectionFromArray(letters, { last: 2 });
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
        },
      });
    });

    it('respects an overly large last', () => {
      const c = connectionFromArray(letters, { last: 10 });
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
        },
      });
    });
  });

  describe('pagination', () => {
    it('respects first and after', () => {
      const c = connectionFromArray(letters, {
        first: 2,
        after: 'YXJyYXljb25uZWN0aW9uOjE=',
      });
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
        },
      });
    });

    it('respects first and after with long first', () => {
      const c = connectionFromArray(letters, {
        first: 10,
        after: 'YXJyYXljb25uZWN0aW9uOjE=',
      });
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
        },
      });
    });

    it('respects last and before', () => {
      const c = connectionFromArray(letters, {
        last: 2,
        before: 'YXJyYXljb25uZWN0aW9uOjM=',
      });
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
        },
      });
    });

    it('respects last and before with long last', () => {
      const c = connectionFromArray(letters, {
        last: 10,
        before: 'YXJyYXljb25uZWN0aW9uOjM=',
      });
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
        },
      });
    });

    it('respects first and after and before, too few', () => {
      const c = connectionFromArray(letters, {
        first: 2,
        after: 'YXJyYXljb25uZWN0aW9uOjA=',
        before: 'YXJyYXljb25uZWN0aW9uOjQ=',
      });
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
        },
      });
    });

    it('respects first and after and before, too many', () => {
      const c = connectionFromArray(letters, {
        first: 4,
        after: 'YXJyYXljb25uZWN0aW9uOjA=',
        before: 'YXJyYXljb25uZWN0aW9uOjQ=',
      });
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
        },
      });
    });

    it('respects first and after and before, exactly right', () => {
      const c = connectionFromArray(letters, {
        first: 3,
        after: 'YXJyYXljb25uZWN0aW9uOjA=',
        before: 'YXJyYXljb25uZWN0aW9uOjQ=',
      });
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
        },
      });
    });

    it('respects last and after and before, too few', () => {
      const c = connectionFromArray(letters, {
        last: 2,
        after: 'YXJyYXljb25uZWN0aW9uOjA=',
        before: 'YXJyYXljb25uZWN0aW9uOjQ=',
      });
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
        },
      });
    });

    it('respects last and after and before, too many', () => {
      const c = connectionFromArray(letters, {
        last: 4,
        after: 'YXJyYXljb25uZWN0aW9uOjA=',
        before: 'YXJyYXljb25uZWN0aW9uOjQ=',
      });
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
        },
      });
    });

    it('respects last and after and before, exactly right', () => {
      const c = connectionFromArray(letters, {
        last: 3,
        after: 'YXJyYXljb25uZWN0aW9uOjA=',
        before: 'YXJyYXljb25uZWN0aW9uOjQ=',
      });
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
        },
      });
    });
  });

  describe('cursor edge cases', () => {
    it('throws an error if first < 0', () => {
      expect(() => {
        connectionFromArray(letters, { first: -1 });
      }).to.throw('Argument "first" must be a non-negative integer');
    });

    it('throws an error if last < 0', () => {
      expect(() => {
        connectionFromArray(letters, { last: -1 });
      }).to.throw('Argument "last" must be a non-negative integer');
    });

    it('returns all elements if cursors are invalid', () => {
      const c = connectionFromArray(letters, {
        before: 'invalid',
        after: 'invalid',
      });
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
        },
      });
    });

    it('returns all elements if cursors are on the outside', () => {
      const c = connectionFromArray(letters, {
        before: 'YXJyYXljb25uZWN0aW9uOjYK',
        after: 'YXJyYXljb25uZWN0aW9uOi0xCg==',
      });
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
        },
      });
    });

    it('returns no elements if cursors cross', () => {
      const c = connectionFromArray(letters, {
        before: 'YXJyYXljb25uZWN0aW9uOjI=',
        after: 'YXJyYXljb25uZWN0aW9uOjQ=',
      });
      return expect(c).to.deep.equal({
        edges: [],
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });
  });

  describe('cursorForObjectInConnection()', () => {
    it("returns an edge's cursor, given an array and a member object", () => {
      const letterBCursor = cursorForObjectInConnection(letters, 'B');
      return expect(letterBCursor).to.equal('YXJyYXljb25uZWN0aW9uOjE=');
    });

    it('returns null, given an array and a non-member object', () => {
      const letterFCursor = cursorForObjectInConnection(letters, 'F');
      return expect(letterFCursor).to.be.null;
    });
  });
});

describe('connectionFromPromisedArray()', () => {
  const letters = Promise.resolve(['A', 'B', 'C', 'D', 'E']);

  it('returns all elements without filters', async () => {
    const c = await connectionFromPromisedArray(letters, {});
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
      },
    });
  });

  it('respects a smaller first', async () => {
    const c = await connectionFromPromisedArray(letters, { first: 2 });
    return expect(c).to.deep.equal({
      edges: [
        { node: 'A', cursor: 'YXJyYXljb25uZWN0aW9uOjA=' },
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
      },
    });
  });
});

describe('connectionFromArraySlice()', () => {
  const letters = ['A', 'B', 'C', 'D', 'E'];

  it('works with a just-right array slice', () => {
    const c = connectionFromArraySlice(
      letters.slice(1, 3),
      {
        first: 2,
        after: 'YXJyYXljb25uZWN0aW9uOjA=',
      },
      {
        sliceStart: 1,
        arrayLength: 5,
      },
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
      },
    });
  });

  it('works with an oversized array slice ("left" side)', () => {
    const c = connectionFromArraySlice(
      letters.slice(0, 3),
      {
        first: 2,
        after: 'YXJyYXljb25uZWN0aW9uOjA=',
      },
      {
        sliceStart: 0,
        arrayLength: 5,
      },
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
      },
    });
  });

  it('works with an oversized array slice ("right" side)', () => {
    const c = connectionFromArraySlice(
      letters.slice(2, 4),
      {
        first: 1,
        after: 'YXJyYXljb25uZWN0aW9uOjE=',
      },
      {
        sliceStart: 2,
        arrayLength: 5,
      },
    );
    return expect(c).to.deep.equal({
      edges: [
        {
          node: 'C',
          cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
        },
      ],
      pageInfo: {
        startCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
        endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('works with an oversized array slice (both sides)', () => {
    const c = connectionFromArraySlice(
      letters.slice(1, 4),
      {
        first: 1,
        after: 'YXJyYXljb25uZWN0aW9uOjE=',
      },
      {
        sliceStart: 1,
        arrayLength: 5,
      },
    );
    return expect(c).to.deep.equal({
      edges: [
        {
          node: 'C',
          cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
        },
      ],
      pageInfo: {
        startCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
        endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('works with an undersized array slice ("left" side)', () => {
    const c = connectionFromArraySlice(
      letters.slice(3, 5),
      {
        first: 3,
        after: 'YXJyYXljb25uZWN0aW9uOjE=',
      },
      {
        sliceStart: 3,
        arrayLength: 5,
      },
    );
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
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  });

  it('works with an undersized array slice ("right" side)', () => {
    const c = connectionFromArraySlice(
      letters.slice(2, 4),
      {
        first: 3,
        after: 'YXJyYXljb25uZWN0aW9uOjE=',
      },
      {
        sliceStart: 2,
        arrayLength: 5,
      },
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
      },
    });
  });

  it('works with an undersized array slice (both sides)', () => {
    const c = connectionFromArraySlice(
      letters.slice(3, 4),
      {
        first: 3,
        after: 'YXJyYXljb25uZWN0aW9uOjE=',
      },
      {
        sliceStart: 3,
        arrayLength: 5,
      },
    );
    return expect(c).to.deep.equal({
      edges: [
        {
          node: 'D',
          cursor: 'YXJyYXljb25uZWN0aW9uOjM=',
        },
      ],
      pageInfo: {
        startCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
        endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });
});

describe('connectionFromPromisedArraySlice()', () => {
  it('respects a smaller first', async () => {
    const letters = Promise.resolve(['A', 'B', 'C']);
    const c = await connectionFromPromisedArraySlice(
      letters,
      { first: 2 },
      {
        sliceStart: 0,
        arrayLength: 5,
      },
    );
    return expect(c).to.deep.equal({
      edges: [
        { node: 'A', cursor: 'YXJyYXljb25uZWN0aW9uOjA=' },
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
      },
    });
  });
});
