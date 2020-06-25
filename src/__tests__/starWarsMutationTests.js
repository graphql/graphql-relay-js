// @flow strict

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { graphqlSync } from 'graphql';

import { StarWarsSchema } from './starWarsSchema.js';

describe('Star Wars mutations', () => {
  it('mutates the data set', () => {
    const mutation = `
      mutation AddBWingQuery($input: IntroduceShipInput!) {
        introduceShip(input: $input) {
          ship {
            id
            name
          }
          faction {
            name
          }
          clientMutationId
        }
      }
    `;
    const params = {
      input: {
        shipName: 'B-Wing',
        factionId: '1',
        clientMutationId: 'abcde',
      },
    };
    const expected = {
      introduceShip: {
        ship: {
          id: 'U2hpcDo5',
          name: 'B-Wing',
        },
        faction: {
          name: 'Alliance to Restore the Republic',
        },
        clientMutationId: 'abcde',
      },
    };
    const result = graphqlSync(StarWarsSchema, mutation, null, null, params);
    expect(result).to.deep.equal({ data: expected });
  });
});
