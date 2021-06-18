import { expect } from 'chai';
import { describe, it } from 'mocha';
import { graphqlSync } from 'graphql';

import { StarWarsSchema as schema } from './starWarsSchema';

describe('Star Wars mutations', () => {
  it('mutates the data set', () => {
    const source = `
      mutation ($input: IntroduceShipInput!) {
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
    const variableValues = {
      input: {
        shipName: 'B-Wing',
        factionId: '1',
        clientMutationId: 'abcde',
      },
    };

    const result = graphqlSync({ schema, source, variableValues });
    expect(result).to.deep.equal({
      data: {
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
      },
    });
  });
});
