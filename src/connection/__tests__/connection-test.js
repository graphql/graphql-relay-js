import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphqlSync,
  printSchema,
} from 'graphql';

import { dedent } from '../../__testUtils__/dedent';

import { connectionFromArray } from '../arrayConnection';

import {
  backwardConnectionArgs,
  connectionArgs,
  connectionDefinitions,
  forwardConnectionArgs,
} from '../connection';

const allUsers = [
  { name: 'Dan', friends: [1, 2, 3, 4] },
  { name: 'Nick', friends: [0, 2, 3, 4] },
  { name: 'Lee', friends: [0, 1, 3, 4] },
  { name: 'Joe', friends: [0, 1, 2, 4] },
  { name: 'Tim', friends: [0, 1, 2, 3] },
];

const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: {
      type: GraphQLString,
    },
    friends: {
      type: friendConnection,
      args: connectionArgs,
      resolve: (user, args) => connectionFromArray(user.friends, args),
    },
    friendsForward: {
      type: userConnection,
      args: forwardConnectionArgs,
      resolve: (user, args) => connectionFromArray(user.friends, args),
    },
    friendsBackward: {
      type: userConnection,
      args: backwardConnectionArgs,
      resolve: (user, args) => connectionFromArray(user.friends, args),
    },
  }),
});

const { connectionType: friendConnection } = connectionDefinitions({
  name: 'Friend',
  nodeType: userType,
  resolveNode: (edge) => allUsers[edge.node],
  edgeFields: () => ({
    friendshipTime: {
      type: GraphQLString,
      resolve: () => 'Yesterday',
    },
  }),
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      resolve: () => allUsers.length - 1,
    },
  }),
});

const { connectionType: userConnection } = connectionDefinitions({
  nodeType: userType,
  resolveNode: (edge) => allUsers[edge.node],
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    user: {
      type: userType,
      resolve: () => allUsers[0],
    },
  }),
});

const schema = new GraphQLSchema({
  query: queryType,
});

describe('connectionDefinition()', () => {
  it('includes connection and edge fields', () => {
    const source = `
      {
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

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        user: {
          friends: {
            totalCount: 4,
            edges: [
              {
                friendshipTime: 'Yesterday',
                node: { name: 'Nick' },
              },
              {
                friendshipTime: 'Yesterday',
                node: { name: 'Lee' },
              },
            ],
          },
        },
      },
    });
  });

  it('works with forwardConnectionArgs', () => {
    const source = `
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

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        user: {
          friendsForward: {
            edges: [{ node: { name: 'Nick' } }, { node: { name: 'Lee' } }],
          },
        },
      },
    });
  });

  it('works with backwardConnectionArgs', () => {
    const source = `
      {
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

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        user: {
          friendsBackward: {
            edges: [{ node: { name: 'Joe' } }, { node: { name: 'Tim' } }],
          },
        },
      },
    });
  });

  it('generates correct types', () => {
    // FIXME remove trimEnd after we update to `graphql@16.0.0`
    expect(printSchema(schema).trimEnd()).to.deep.equal(dedent`
      type Query {
        user: User
      }

      type User {
        name: String
        friends(after: String, first: Int, before: String, last: Int): FriendConnection
        friendsForward(after: String, first: Int): UserConnection
        friendsBackward(before: String, last: Int): UserConnection
      }

      """A connection to a list of items."""
      type FriendConnection {
        """Information to aid in pagination."""
        pageInfo: PageInfo!

        """A list of edges."""
        edges: [FriendEdge]
        totalCount: Int
      }

      """Information about pagination in a connection."""
      type PageInfo {
        """When paginating forwards, are there more items?"""
        hasNextPage: Boolean!

        """When paginating backwards, are there more items?"""
        hasPreviousPage: Boolean!

        """When paginating backwards, the cursor to continue."""
        startCursor: String

        """When paginating forwards, the cursor to continue."""
        endCursor: String
      }

      """An edge in a connection."""
      type FriendEdge {
        """The item at the end of the edge"""
        node: User

        """A cursor for use in pagination"""
        cursor: String!
        friendshipTime: String
      }

      """A connection to a list of items."""
      type UserConnection {
        """Information to aid in pagination."""
        pageInfo: PageInfo!

        """A list of edges."""
        edges: [UserEdge]
      }

      """An edge in a connection."""
      type UserEdge {
        """The item at the end of the edge"""
        node: User

        """A cursor for use in pagination"""
        cursor: String!
      }
    `);
  });
});
