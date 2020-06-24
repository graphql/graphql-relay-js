// @flow strict

import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from 'graphql';

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
        url: 'www.facebook.com/' + username + '?lang=' + lang,
      }),
    }),
  }),
});

const schema = new GraphQLSchema({
  query: queryType,
});

const context = { lang: 'en' };

describe('pluralIdentifyingRootField()', () => {
  it('allows fetching', async () => {
    const query = `{
      usernames(usernames:[ "dschafer", "leebyron", "schrockn" ]) {
        username
        url
      }
    }`;

    return expect(await graphql(schema, query, null, context)).to.deep.equal({
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

  it('correctly introspects', async () => {
    const query = `{
      __schema {
        queryType {
          fields {
            name
            args {
              name
              type {
                kind
                ofType {
                  kind
                  ofType {
                    kind
                    ofType {
                      name
                      kind
                    }
                  }
                }
              }
            }
            type {
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }`;

    return expect(await graphql(schema, query)).to.deep.equal({
      data: {
        __schema: {
          queryType: {
            fields: [
              {
                name: 'usernames',
                args: [
                  {
                    name: 'usernames',
                    type: {
                      kind: 'NON_NULL',
                      ofType: {
                        kind: 'LIST',
                        ofType: {
                          kind: 'NON_NULL',
                          ofType: {
                            name: 'String',
                            kind: 'SCALAR',
                          },
                        },
                      },
                    },
                  },
                ],
                type: {
                  kind: 'LIST',
                  ofType: {
                    name: 'User',
                    kind: 'OBJECT',
                  },
                },
              },
            ],
          },
        },
      },
    });
  });
});
