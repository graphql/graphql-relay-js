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

describe('Star Wars mutations', () => {
  it('mutates the data set', async () => {
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
      }
    };
    const expected = {
      introduceShip: {
        ship: {
          id: 'U2hpcDo5',
          name: 'B-Wing'
        },
        faction: {
          name: 'Alliance to Restore the Republic'
        },
        clientMutationId: 'abcde',
      }
    };
    const result = await graphql(StarWarsSchema, mutation, null, null, params);
    expect(result).to.deep.equal({ data: expected });
  });
});
