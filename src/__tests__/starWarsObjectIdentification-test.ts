import { expect } from 'chai';
import { describe, it } from 'mocha';
import { graphqlSync } from 'graphql';

import { StarWarsSchema as schema } from './starWarsSchema';

describe('Star Wars object identification', () => {
  it('fetches the ID and name of the rebels', () => {
    const source = `
      {
        rebels {
          id
          name
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        rebels: {
          id: 'RmFjdGlvbjox',
          name: 'Alliance to Restore the Republic',
        },
      },
    });
  });

  it('fetches the rebels by global ID', () => {
    const source = `
      {
        node(id: "RmFjdGlvbjox") {
          id
          ... on Faction {
            name
          }
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        node: {
          id: 'RmFjdGlvbjox',
          name: 'Alliance to Restore the Republic',
        },
      },
    });
  });

  it('fetches the ID and name of the empire', () => {
    const source = `
      {
        empire {
          id
          name
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        empire: { id: 'RmFjdGlvbjoy', name: 'Galactic Empire' },
      },
    });
  });

  it('fetches the empire by global ID', () => {
    const source = `
      {
        node(id: "RmFjdGlvbjoy") {
          id
          ... on Faction {
            name
          }
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        node: { id: 'RmFjdGlvbjoy', name: 'Galactic Empire' },
      },
    });
  });

  it('fetches the X-Wing by global ID', () => {
    const source = `
      {
        node(id: "U2hpcDox") {
          id
          ... on Ship {
            name
          }
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        node: { id: 'U2hpcDox', name: 'X-Wing' },
      },
    });
  });
});
