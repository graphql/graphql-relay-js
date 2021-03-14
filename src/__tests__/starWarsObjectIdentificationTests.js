import { expect } from 'chai';
import { describe, it } from 'mocha';
import { graphqlSync } from 'graphql';

import { StarWarsSchema } from './starWarsSchema';

describe('Star Wars object identification', () => {
  it('fetches the ID and name of the rebels', () => {
    const query = `
      query RebelsQuery {
        rebels {
          id
          name
        }
      }
    `;

    expect(graphqlSync(StarWarsSchema, query)).to.deep.equal({
      data: {
        rebels: {
          id: 'RmFjdGlvbjox',
          name: 'Alliance to Restore the Republic',
        },
      },
    });
  });

  it('refetches the rebels', () => {
    const query = `
      query RebelsRefetchQuery {
        node(id: "RmFjdGlvbjox") {
          id
          ... on Faction {
            name
          }
        }
      }
    `;

    expect(graphqlSync(StarWarsSchema, query)).to.deep.equal({
      data: {
        node: {
          id: 'RmFjdGlvbjox',
          name: 'Alliance to Restore the Republic',
        },
      },
    });
  });

  it('fetches the ID and name of the empire', () => {
    const query = `
      query EmpireQuery {
        empire {
          id
          name
        }
      }
    `;

    expect(graphqlSync(StarWarsSchema, query)).to.deep.equal({
      data: {
        empire: {
          id: 'RmFjdGlvbjoy',
          name: 'Galactic Empire',
        },
      },
    });
  });

  it('refetches the empire', () => {
    const query = `
      query EmpireRefetchQuery {
        node(id: "RmFjdGlvbjoy") {
          id
          ... on Faction {
            name
          }
        }
      }
    `;

    expect(graphqlSync(StarWarsSchema, query)).to.deep.equal({
      data: {
        node: {
          id: 'RmFjdGlvbjoy',
          name: 'Galactic Empire',
        },
      },
    });
  });

  it('refetches the X-Wing', () => {
    const query = `
      query XWingRefetchQuery {
        node(id: "U2hpcDox") {
          id
          ... on Ship {
            name
          }
        }
      }
    `;

    expect(graphqlSync(StarWarsSchema, query)).to.deep.equal({
      data: {
        node: {
          id: 'U2hpcDox',
          name: 'X-Wing',
        },
      },
    });
  });
});
