/* @flow */
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
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql
} from 'graphql';

import {
  pluralIdentifyingRootField
} from '../plural';

var userType = new GraphQLObjectType({
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

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    usernames: pluralIdentifyingRootField({
      argName: 'usernames',
      description: 'Map from a username to the user',
      inputType: GraphQLString,
      outputType: userType,
      resolveSingleInput: (username, context, {rootValue: {lang}}) => ({
        username: username,
        url: 'www.facebook.com/' + username + '?lang=' + lang
      })
    })
  })
});

var schema = new GraphQLSchema({
  query: queryType
});

var rootVal = {lang: 'en'};

describe('pluralIdentifyingRootField()', () => {
  it('allows fetching', () => {
    var query = `{
      usernames(usernames:["dschafer", "leebyron", "schrockn"]) {
        username
        url
      }
    }`;
    var expected = {
      usernames: [
        {
          username: 'dschafer',
          url: 'www.facebook.com/dschafer?lang=en'
        },
        {
          username: 'leebyron',
          url: 'www.facebook.com/leebyron?lang=en'
        },
        {
          username: 'schrockn',
          url: 'www.facebook.com/schrockn?lang=en'
        },
      ]
    };

    return expect(graphql(schema, query, rootVal)).to.become({data: expected});
  });

  it('correctly introspects', () => {
    var query = `{
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
    var expected = {
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
                        }
                      }
                    }
                  }
                }
              ],
              type: {
                kind: 'LIST',
                ofType: {
                  name: 'User',
                  kind: 'OBJECT',
                }
              }
            }
          ]
        }
      }
    };

    return expect(graphql(schema, query)).to.become({data: expected});
  });
});
