import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  offsetToCursor,
  connectionFromArray,
  connectionFromArraySlice,
  connectionFromPromisedArray,
  connectionFromPromisedArraySlice,
  cursorForObjectInConnection,
} from '../arrayConnection';

const arrayABCDE = ['A', 'B', 'C', 'D', 'E'];

const cursorA = 'YXJyYXljb25uZWN0aW9uOjA=';
const cursorB = 'YXJyYXljb25uZWN0aW9uOjE=';
const cursorC = 'YXJyYXljb25uZWN0aW9uOjI=';
const cursorD = 'YXJyYXljb25uZWN0aW9uOjM=';
const cursorE = 'YXJyYXljb25uZWN0aW9uOjQ=';

const edgeA = { node: 'A', cursor: cursorA };
const edgeB = { node: 'B', cursor: cursorB };
const edgeC = { node: 'C', cursor: cursorC };
const edgeD = { node: 'D', cursor: cursorD };
const edgeE = { node: 'E', cursor: cursorE };

describe('connectionFromArray()', () => {
  describe('basic slicing', () => {
    it('returns all elements without filters', () => {
      const c = connectionFromArray(arrayABCDE, {});
      expect(c).to.deep.equal({
        edges: [edgeA, edgeB, edgeC, edgeD, edgeE],
        pageInfo: {
          startCursor: cursorA,
          endCursor: cursorE,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('respects a smaller first', () => {
      const c = connectionFromArray(arrayABCDE, { first: 2 });
      expect(c).to.deep.equal({
        edges: [edgeA, edgeB],
        pageInfo: {
          startCursor: cursorA,
          endCursor: cursorB,
          hasPreviousPage: false,
          hasNextPage: true,
        },
      });
    });

    it('respects an overly large first', () => {
      const c = connectionFromArray(arrayABCDE, { first: 10 });
      expect(c).to.deep.equal({
        edges: [edgeA, edgeB, edgeC, edgeD, edgeE],
        pageInfo: {
          startCursor: cursorA,
          endCursor: cursorE,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('respects a smaller last', () => {
      const c = connectionFromArray(arrayABCDE, { last: 2 });
      expect(c).to.deep.equal({
        edges: [edgeD, edgeE],
        pageInfo: {
          startCursor: cursorD,
          endCursor: cursorE,
          hasPreviousPage: true,
          hasNextPage: false,
        },
      });
    });

    it('respects an overly large last', () => {
      const c = connectionFromArray(arrayABCDE, { last: 10 });
      expect(c).to.deep.equal({
        edges: [edgeA, edgeB, edgeC, edgeD, edgeE],
        pageInfo: {
          startCursor: cursorA,
          endCursor: cursorE,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });
  });

  describe('pagination', () => {
    it('respects first and after', () => {
      const c = connectionFromArray(arrayABCDE, {
        first: 2,
        after: cursorB,
      });
      expect(c).to.deep.equal({
        edges: [edgeC, edgeD],
        pageInfo: {
          startCursor: cursorC,
          endCursor: cursorD,
          hasPreviousPage: false,
          hasNextPage: true,
        },
      });
    });

    it('respects first and after with long first', () => {
      const c = connectionFromArray(arrayABCDE, {
        first: 10,
        after: cursorB,
      });
      expect(c).to.deep.equal({
        edges: [edgeC, edgeD, edgeE],
        pageInfo: {
          startCursor: cursorC,
          endCursor: cursorE,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('respects last and before', () => {
      const c = connectionFromArray(arrayABCDE, {
        last: 2,
        before: cursorD,
      });
      expect(c).to.deep.equal({
        edges: [edgeB, edgeC],
        pageInfo: {
          startCursor: cursorB,
          endCursor: cursorC,
          hasPreviousPage: true,
          hasNextPage: false,
        },
      });
    });

    it('respects last and before with long last', () => {
      const c = connectionFromArray(arrayABCDE, {
        last: 10,
        before: cursorD,
      });
      expect(c).to.deep.equal({
        edges: [edgeA, edgeB, edgeC],
        pageInfo: {
          startCursor: cursorA,
          endCursor: cursorC,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('respects first and after and before, too few', () => {
      const c = connectionFromArray(arrayABCDE, {
        first: 2,
        after: cursorA,
        before: cursorE,
      });
      expect(c).to.deep.equal({
        edges: [edgeB, edgeC],
        pageInfo: {
          startCursor: cursorB,
          endCursor: cursorC,
          hasPreviousPage: false,
          hasNextPage: true,
        },
      });
    });

    it('respects first and after and before, too many', () => {
      const c = connectionFromArray(arrayABCDE, {
        first: 4,
        after: cursorA,
        before: cursorE,
      });
      expect(c).to.deep.equal({
        edges: [edgeB, edgeC, edgeD],
        pageInfo: {
          startCursor: cursorB,
          endCursor: cursorD,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('respects first and after and before, exactly right', () => {
      const c = connectionFromArray(arrayABCDE, {
        first: 3,
        after: cursorA,
        before: cursorE,
      });
      expect(c).to.deep.equal({
        edges: [edgeB, edgeC, edgeD],
        pageInfo: {
          startCursor: cursorB,
          endCursor: cursorD,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('respects last and after and before, too few', () => {
      const c = connectionFromArray(arrayABCDE, {
        last: 2,
        after: cursorA,
        before: cursorE,
      });
      expect(c).to.deep.equal({
        edges: [edgeC, edgeD],
        pageInfo: {
          startCursor: cursorC,
          endCursor: cursorD,
          hasPreviousPage: true,
          hasNextPage: false,
        },
      });
    });

    it('respects last and after and before, too many', () => {
      const c = connectionFromArray(arrayABCDE, {
        last: 4,
        after: cursorA,
        before: cursorE,
      });
      expect(c).to.deep.equal({
        edges: [edgeB, edgeC, edgeD],
        pageInfo: {
          startCursor: cursorB,
          endCursor: cursorD,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('respects last and after and before, exactly right', () => {
      const c = connectionFromArray(arrayABCDE, {
        last: 3,
        after: cursorA,
        before: cursorE,
      });
      expect(c).to.deep.equal({
        edges: [edgeB, edgeC, edgeD],
        pageInfo: {
          startCursor: cursorB,
          endCursor: cursorD,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });
  });

  describe('cursor edge cases', () => {
    it('throws an error if first < 0', () => {
      expect(() => {
        connectionFromArray(arrayABCDE, { first: -1 });
      }).to.throw('Argument "first" must be a non-negative integer');
    });

    it('throws an error if last < 0', () => {
      expect(() => {
        connectionFromArray(arrayABCDE, { last: -1 });
      }).to.throw('Argument "last" must be a non-negative integer');
    });

    it('returns all elements if cursors are invalid', () => {
      const c1 = connectionFromArray(arrayABCDE, {
        before: 'InvalidBase64',
        after: 'InvalidBase64',
      });

      const invalidUnicodeInBase64 = '9JCAgA=='; // U+110000
      const c2 = connectionFromArray(arrayABCDE, {
        before: invalidUnicodeInBase64,
        after: invalidUnicodeInBase64,
      });

      expect(c1).to.deep.equal(c2);
      expect(c1).to.deep.equal({
        edges: [edgeA, edgeB, edgeC, edgeD, edgeE],
        pageInfo: {
          startCursor: cursorA,
          endCursor: cursorE,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('returns all elements if cursors are on the outside', () => {
      const allEdges = {
        edges: [edgeA, edgeB, edgeC, edgeD, edgeE],
        pageInfo: {
          startCursor: cursorA,
          endCursor: cursorE,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };

      expect(
        connectionFromArray(arrayABCDE, { before: offsetToCursor(6) }),
      ).to.deep.equal(allEdges);
      expect(
        connectionFromArray(arrayABCDE, { before: offsetToCursor(-1) }),
      ).to.deep.equal(allEdges);

      expect(
        connectionFromArray(arrayABCDE, { after: offsetToCursor(6) }),
      ).to.deep.equal(allEdges);
      expect(
        connectionFromArray(arrayABCDE, { after: offsetToCursor(-1) }),
      ).to.deep.equal(allEdges);
    });

    it('returns no elements if cursors cross', () => {
      const c = connectionFromArray(arrayABCDE, {
        before: cursorC,
        after: cursorE,
      });
      expect(c).to.deep.equal({
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
      const letterBCursor = cursorForObjectInConnection(arrayABCDE, 'B');
      expect(letterBCursor).to.equal(cursorB);
    });

    it('returns null, given an array and a non-member object', () => {
      const letterFCursor = cursorForObjectInConnection(arrayABCDE, 'F');
      expect(letterFCursor).to.equal(null);
    });
  });
});

describe('connectionFromPromisedArray()', () => {
  it('returns all elements without filters', async () => {
    const c = await connectionFromPromisedArray(
      Promise.resolve(arrayABCDE),
      {},
    );
    expect(c).to.deep.equal({
      edges: [edgeA, edgeB, edgeC, edgeD, edgeE],
      pageInfo: {
        startCursor: cursorA,
        endCursor: cursorE,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  });

  it('respects a smaller first', async () => {
    const c = await connectionFromPromisedArray(Promise.resolve(arrayABCDE), {
      first: 2,
    });
    expect(c).to.deep.equal({
      edges: [edgeA, edgeB],
      pageInfo: {
        startCursor: cursorA,
        endCursor: cursorB,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });
});

describe('connectionFromArraySlice()', () => {
  it('works with a just-right array slice', () => {
    const c = connectionFromArraySlice(
      arrayABCDE.slice(1, 3),
      {
        first: 2,
        after: cursorA,
      },
      {
        sliceStart: 1,
        arrayLength: 5,
      },
    );
    expect(c).to.deep.equal({
      edges: [edgeB, edgeC],
      pageInfo: {
        startCursor: cursorB,
        endCursor: cursorC,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('works with an oversized array slice ("left" side)', () => {
    const c = connectionFromArraySlice(
      arrayABCDE.slice(0, 3),
      {
        first: 2,
        after: cursorA,
      },
      {
        sliceStart: 0,
        arrayLength: 5,
      },
    );
    expect(c).to.deep.equal({
      edges: [edgeB, edgeC],
      pageInfo: {
        startCursor: cursorB,
        endCursor: cursorC,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('works with an oversized array slice ("right" side)', () => {
    const c = connectionFromArraySlice(
      arrayABCDE.slice(2, 4),
      {
        first: 1,
        after: cursorB,
      },
      {
        sliceStart: 2,
        arrayLength: 5,
      },
    );
    expect(c).to.deep.equal({
      edges: [edgeC],
      pageInfo: {
        startCursor: cursorC,
        endCursor: cursorC,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('works with an oversized array slice (both sides)', () => {
    const c = connectionFromArraySlice(
      arrayABCDE.slice(1, 4),
      {
        first: 1,
        after: cursorB,
      },
      {
        sliceStart: 1,
        arrayLength: 5,
      },
    );
    expect(c).to.deep.equal({
      edges: [edgeC],
      pageInfo: {
        startCursor: cursorC,
        endCursor: cursorC,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('works with an undersized array slice ("left" side)', () => {
    const c = connectionFromArraySlice(
      arrayABCDE.slice(3, 5),
      {
        first: 3,
        after: cursorB,
      },
      {
        sliceStart: 3,
        arrayLength: 5,
      },
    );
    expect(c).to.deep.equal({
      edges: [edgeD, edgeE],
      pageInfo: {
        startCursor: cursorD,
        endCursor: cursorE,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  });

  it('works with an undersized array slice ("right" side)', () => {
    const c = connectionFromArraySlice(
      arrayABCDE.slice(2, 4),
      {
        first: 3,
        after: cursorB,
      },
      {
        sliceStart: 2,
        arrayLength: 5,
      },
    );
    expect(c).to.deep.equal({
      edges: [edgeC, edgeD],
      pageInfo: {
        startCursor: cursorC,
        endCursor: cursorD,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });

  it('works with an undersized array slice (both sides)', () => {
    const c = connectionFromArraySlice(
      arrayABCDE.slice(3, 4),
      {
        first: 3,
        after: cursorB,
      },
      {
        sliceStart: 3,
        arrayLength: 5,
      },
    );
    expect(c).to.deep.equal({
      edges: [edgeD],
      pageInfo: {
        startCursor: cursorD,
        endCursor: cursorD,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });
});

describe('connectionFromPromisedArraySlice()', () => {
  it('respects a smaller first', async () => {
    const c = await connectionFromPromisedArraySlice(
      Promise.resolve(arrayABCDE),
      { first: 2 },
      {
        sliceStart: 0,
        arrayLength: 5,
      },
    );
    expect(c).to.deep.equal({
      edges: [edgeA, edgeB],
      pageInfo: {
        startCursor: cursorA,
        endCursor: cursorB,
        hasPreviousPage: false,
        hasNextPage: true,
      },
    });
  });
});
