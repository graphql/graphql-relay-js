/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql
} from 'graphql';

import {
  nodeDefinitions
} from '../node';

var userData = {
  1: {
    id: 1,
    name: 'John Doe'
  },
  2: {
    id: 2,
    name: 'Jane Smith'
  },
};

var {nodeField, nodeInterface} = nodeDefinitions(
  (id) => {
    return userData[id];
  },
  () => {
    return userType;
  }
);

var userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
  }),
  interfaces: [nodeInterface]
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField
  })
});

var schema = new GraphQLSchema({
  query: queryType,
  types: [userType]
});

describe('Node interface and fields with async object fetcher', () => {
  it('gets the correct ID for users', () => {
    var query = `{
      node(id: "1") {
        id
      }
    }`;
    var expected = {
      node: {
        id: '1',
      }
    };

    return expect(graphql(schema, query)).to.become({data: expected});
  });

  it('gets the correct name for users', () => {
    var query = `{
      node(id: "1") {
        id
        ... on User {
          name
        }
      }
    }`;
    var expected = {
      node: {
        id: '1',
        name: 'John Doe',
      }
    };

    return expect(graphql(schema, query)).to.become({data: expected});
  });
});
