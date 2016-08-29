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
  GraphQLInputObjectType,
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLList,
  GraphQLNonNull,
  graphql
} from 'graphql';

import {
  pluralIdentifyingRootField,
  nonNull
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
      // rootValue Graphql(mixed) -> relay(object)
      // :any to ignore type check in test.
      resolveSingleInput: (username, context, {rootValue}) => ({
        username: username,
        url: 'www.facebook.com/' + username + '?lang=' + (rootValue:any).lang
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

describe('nonNull()', () => {
  function qlScalar() {
    return new GraphQLScalarType({
      name: 'scalar',
      serialize: String,
      description: 'test'
    });
  }

  it('covert GraphQLInputObjectType to NonNull type', () => {
    const inputType = new GraphQLInputObjectType({
      name: 'input',
      fields: {
        test: {
          type: qlScalar()
        }
      }
    });
    const result = nonNull(inputType);
    expect(result).to.be.an.instanceof(GraphQLNonNull);
    expect(result.ofType).to.deep.equal(inputType);
  });

  it('covert GraphQLScalarType to NonNull type', () => {
    const scalarType = qlScalar();
    const result = nonNull(scalarType);
    expect(result).to.be.an.instanceof(GraphQLNonNull);
    expect(result.ofType).to.deep.equal(scalarType);
  });

  it('covert GraphQLEnumType to NonNull type', () => {
    const enumType = new GraphQLEnumType({
      name: 'EM',
      values: {
        E: { value: 0},
        M: { value: 1}
      }
    });
    const result = nonNull(enumType);
    expect(result).to.be.an.instanceof(GraphQLNonNull);
    expect(result.ofType).to.deep.equal(enumType);
  });

  it('covert GraphQLList to NonNull type', () => {
    const listType = new GraphQLList(GraphQLString);
    const result = nonNull(listType);
    expect(result).to.be.an.instanceof(GraphQLNonNull);
    expect(result.ofType).to.deep.equal(listType);
  });

  it('does nothing to GraphQLNonNull Type', () => {
    const nonNullType = new GraphQLNonNull(GraphQLString);
    const result = nonNull(nonNullType);
    expect(result).to.deep.equal(nonNullType);
  });
});
