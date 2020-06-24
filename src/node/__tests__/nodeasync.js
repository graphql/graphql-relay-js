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
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from 'graphql';

import { nodeDefinitions } from '../node';

const userData = {
  '1': {
    id: 1,
    name: 'John Doe',
  },
  '2': {
    id: 2,
    name: 'Jane Smith',
  },
};

const { nodeField, nodeInterface } = nodeDefinitions(
  (id) => {
    return userData[id];
  },
  () => {
    return userType;
  },
);

const userType = new GraphQLObjectType({
  name: 'User',
  interfaces: [nodeInterface],
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
  }),
});

const schema = new GraphQLSchema({
  query: queryType,
  types: [userType],
});

describe('Node interface and fields with async object fetcher', () => {
  it('gets the correct ID for users', async () => {
    const query = `{
      node(id: "1") {
        id
      }
    }`;

    return expect(await graphql(schema, query)).to.deep.equal({
      data: {
        node: {
          id: '1',
        },
      },
    });
  });

  it('gets the correct name for users', async () => {
    const query = `{
      node(id: "1") {
        id
        ... on User {
          name
        }
      }
    }`;

    return expect(await graphql(schema, query)).to.deep.equal({
      data: {
        node: {
          id: '1',
          name: 'John Doe',
        },
      },
    });
  });
});
