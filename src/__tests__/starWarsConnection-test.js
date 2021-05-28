import { expect } from 'chai';
import { describe, it } from 'mocha';
import { graphqlSync } from 'graphql';

import { StarWarsSchema as schema } from './starWarsSchema';

describe('Star Wars connections', () => {
  it('fetches the first ship of the rebels', () => {
    const source = `
      {
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

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        rebels: {
          name: 'Alliance to Restore the Republic',
          ships: {
            edges: [
              {
                node: { name: 'X-Wing' },
              },
            ],
          },
        },
      },
    });
  });

  it('fetches the first two ships of the rebels with a cursor', () => {
    const source = `
      {
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

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        rebels: {
          name: 'Alliance to Restore the Republic',
          ships: {
            edges: [
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
                node: { name: 'X-Wing' },
              },
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
                node: { name: 'Y-Wing' },
              },
            ],
          },
        },
      },
    });
  });

  it('fetches the next three ships of the rebels with a cursor', () => {
    const source = `
      {
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

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        rebels: {
          name: 'Alliance to Restore the Republic',
          ships: {
            edges: [
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjI=',
                node: { name: 'A-Wing' },
              },
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjM=',
                node: { name: 'Millennium Falcon' },
              },
              {
                cursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
                node: { name: 'Home One' },
              },
            ],
          },
        },
      },
    });
  });

  it('fetches no ships of the rebels at the end of connection', () => {
    const source = `
      {
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

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        rebels: {
          name: 'Alliance to Restore the Republic',
          ships: {
            edges: [],
          },
        },
      },
    });
  });

  it('identifies the end of the list', () => {
    const source = `
      {
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

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        rebels: {
          name: 'Alliance to Restore the Republic',
          originalShips: {
            edges: [
              {
                node: { name: 'X-Wing' },
              },
              {
                node: { name: 'Y-Wing' },
              },
            ],
            pageInfo: { hasNextPage: true },
          },
          moreShips: {
            edges: [
              {
                node: { name: 'A-Wing' },
              },
              {
                node: { name: 'Millennium Falcon' },
              },
              {
                node: { name: 'Home One' },
              },
            ],
            pageInfo: { hasNextPage: false },
          },
        },
      },
    });
  });
});
