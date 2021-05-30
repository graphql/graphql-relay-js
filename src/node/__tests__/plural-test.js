import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphqlSync,
  printSchema,
} from 'graphql';

import { dedent } from '../../__testUtils__/dedent';

import { pluralIdentifyingRootField } from '../plural';

const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    username: {
      type: GraphQLString,
    },
    url: {
      type: GraphQLString,
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    usernames: pluralIdentifyingRootField({
      argName: 'usernames',
      description: 'Map from a username to the user',
      inputType: GraphQLString,
      outputType: userType,
      resolveSingleInput: (username, { lang }) => ({
        username,
        url: `www.facebook.com/${username}?lang=${lang}`,
      }),
    }),
  }),
});

const schema = new GraphQLSchema({
  query: queryType,
});

describe('pluralIdentifyingRootField()', () => {
  it('allows fetching', () => {
    const source = `
      {
        usernames(usernames:[ "dschafer", "leebyron", "schrockn" ]) {
          username
          url
        }
      }
    `;

    const contextValue = { lang: 'en' };
    expect(graphqlSync({ schema, source, contextValue })).to.deep.equal({
      data: {
        usernames: [
          {
            username: 'dschafer',
            url: 'www.facebook.com/dschafer?lang=en',
          },
          {
            username: 'leebyron',
            url: 'www.facebook.com/leebyron?lang=en',
          },
          {
            username: 'schrockn',
            url: 'www.facebook.com/schrockn?lang=en',
          },
        ],
      },
    });
  });

  it('generates correct types', () => {
    // FIXME remove trimEnd after we update to `graphql@16.0.0`
    expect(printSchema(schema).trimEnd()).to.deep.equal(dedent`
      type Query {
        """Map from a username to the user"""
        usernames(usernames: [String!]!): [User]
      }

      type User {
        username: String
        url: String
      }
    `);
  });
});
