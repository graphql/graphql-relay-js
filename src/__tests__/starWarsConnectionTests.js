/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { StarWarsSchema } from './starWarsSchema.js';
import { graphql } from 'graphql';

// 80+ char lines are useful in describe/it, so ignore in this file.
/* eslint-disable max-len */

describe('Star Wars connections', () => {
  it('fetches the first ship of the rebels', async () => {
    const query = `
      query RebelsShipsQuery {
        rebels {
          name,
          ships(first: 1) {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    `;
    const expected = {
      rebels: {
        name: 'Alliance to Restore the Republic',
        ships: {
          edges: [
            {
              node: {
                name: 'X-Wing'
              }
            }
          ]
        }
      }
    };
    const result = await graphql(StarWarsSchema, query);
    expect(result).to.deep.equal({ data: expected });
  });

  it('fetches the first two ships of the rebels with a cursor', async () => {
    const query = `
      query MoreRebelShipsQuery {
        rebels {
          name,
          ships(first: 2) {
            edges {
              cursor,
              node {
                name
              }
            }
          }
        }
      }
    `;
    const expected = {
      rebels: {
        name: 'Alliance to Restore the Republic',
        ships: {
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              node: {
                name: 'X-Wing'
              }
            },
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              node: {
                name: 'Y-Wing'
              }
            }
          ]
        }
      }
    };
    const result = await graphql(StarWarsSchema, query);
    expect(result).to.deep.equal({ data: expected });
  });

  it('fetches the next three ships of the rebels with a cursor', async () => {
    const query = `
      query EndOfRebelShipsQuery {
        rebels {
          name,
          ships(first: 3 after: "YXJyYXljb25uZWN0aW9uOjE=") {
            edges {
              cursor,
              node {
                name
              }
            }
          }
        }
      }
    `;
    const expected = {
      rebels: {
        name: 'Alliance to Restore the Republic',
        ships: {
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
              node: {
                name: 'A-Wing'
              }
            },
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjM=',
              node: {
                name: 'Millenium Falcon'
              }
            },
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
              node: {
                name: 'Home One'
              }
            }
          ]
        }
      }
    };
    const result = await graphql(StarWarsSchema, query);
    expect(result).to.deep.equal({ data: expected });
  });

  it('fetches no ships of the rebels at the end of connection', async () => {
    const query = `
      query RebelsQuery {
        rebels {
          name,
          ships(first: 3 after: "YXJyYXljb25uZWN0aW9uOjQ=") {
            edges {
              cursor,
              node {
                name
              }
            }
          }
        }
      }
    `;
    const expected = {
      rebels: {
        name: 'Alliance to Restore the Republic',
        ships: {
          edges: []
        }
      }
    };
    const result = await graphql(StarWarsSchema, query);
    expect(result).to.deep.equal({ data: expected });
  });

  it('identifies the end of the list', async () => {
    const query = `
      query EndOfRebelShipsQuery {
        rebels {
          name,
          originalShips: ships(first: 2) {
            edges {
              node {
                name
              }
            }
            pageInfo {
              hasNextPage
            }
          }
          moreShips: ships(first: 3 after: "YXJyYXljb25uZWN0aW9uOjE=") {
            edges {
              node {
                name
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    `;
    const expected = {
      rebels: {
        name: 'Alliance to Restore the Republic',
        originalShips: {
          edges: [
            {
              node: {
                name: 'X-Wing'
              }
            },
            {
              node: {
                name: 'Y-Wing'
              }
            }
          ],
          pageInfo: {
            hasNextPage: true
          }
        },
        moreShips: {
          edges: [
            {
              node: {
                name: 'A-Wing'
              }
            },
            {
              node: {
                name: 'Millenium Falcon'
              }
            },
            {
              node: {
                name: 'Home One'
              }
            }
          ],
          pageInfo: {
            hasNextPage: false
          }
        }
      }
    };
    const result = await graphql(StarWarsSchema, query);
    expect(result).to.deep.equal({ data: expected });
  });
});
