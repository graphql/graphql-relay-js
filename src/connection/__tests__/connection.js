/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from 'graphql';

import {
  connectionFromArray,
} from '../arrayconnection.js';

import {
  backwardConnectionArgs,
  connectionArgs,
  connectionDefinitions,
  forwardConnectionArgs,
} from '../connection.js';

import { expect } from 'chai';
import { describe, it } from 'mocha';

var allUsers = [
  { name: 'Dan' },
  { name: 'Nick' },
  { name: 'Lee' },
  { name: 'Joe' },
  { name: 'Tim' },
];

var userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: {
      type: GraphQLString,
    },
    friends: {
      type: friendConnection,
      args: connectionArgs,
      resolve: (user, args) => connectionFromArray(allUsers, args),
    },
    friendsForward: {
      type: friendConnection,
      args: forwardConnectionArgs,
      resolve: (user, args) => connectionFromArray(allUsers, args),
    },
    friendsBackward: {
      type: friendConnection,
      args: backwardConnectionArgs,
      resolve: (user, args) => connectionFromArray(allUsers, args),
    },
  }),
});

var {connectionType: friendConnection} = connectionDefinitions({
  name: 'Friend',
  nodeType: userType,
  edgeFields: () => ({
    friendshipTime: {
      type: GraphQLString,
      resolve: () => 'Yesterday'
    }
  }),
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      resolve: () => allUsers.length
    }
  }),
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    user: {
      type: userType,
      resolve: () => allUsers[0],
    },
  })
});

var schema = new GraphQLSchema({
  query: queryType,
});

describe('connectionDefinition()', () => {
  it('includes connection and edge fields', async () => {
    var query = `
      query FriendsQuery {
        user {
          friends(first: 2) {
            totalCount
            edges {
              friendshipTime
              node {
                name
              }
            }
          }
        }
      }
    `;
    var expected = {
      user: {
        friends: {
          totalCount: 5,
          edges: [
            {
              friendshipTime: 'Yesterday',
              node: {
                name: 'Dan'
              }
            },
            {
              friendshipTime: 'Yesterday',
              node: {
                name: 'Nick'
              }
            },
          ]
        }
      }
    };
    var result = await graphql(schema, query);
    expect(result).to.deep.equal({ data: expected });
  });

  it('works with forwardConnectionArgs', async () => {
    var query = `
      query FriendsQuery {
        user {
          friendsForward(first: 2) {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    `;
    var expected = {
      user: {
        friendsForward: {
          edges: [
            {
              node: {
                name: 'Dan'
              }
            },
            {
              node: {
                name: 'Nick'
              }
            },
          ]
        }
      }
    };
    var result = await graphql(schema, query);
    expect(result).to.deep.equal({ data: expected });
  });

  it('works with backwardConnectionArgs', async () => {
    var query = `
      query FriendsQuery {
        user {
          friendsBackward(last: 2) {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    `;
    var expected = {
      user: {
        friendsBackward: {
          edges: [
            {
              node: {
                name: 'Joe'
              }
            },
            {
              node: {
                name: 'Tim'
              }
            },
          ]
        }
      }
    };
    var result = await graphql(schema, query);
    expect(result).to.deep.equal({ data: expected });
  });
});
