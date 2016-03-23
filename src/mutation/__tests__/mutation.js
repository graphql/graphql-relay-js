/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

// 80+ char lines are useful in describe/it, so ignore in this file.
/* eslint-disable max-len */

import { describe, it } from 'mocha';
import { expect } from 'chai';

import {GraphQLInt, GraphQLObjectType, GraphQLSchema, graphql} from 'graphql';

import {
  mutationWithClientMutationId
} from '../mutation';

var simpleMutation = mutationWithClientMutationId({
  name: 'SimpleMutation',
  inputFields: {},
  outputFields: {
    result: {
      type: GraphQLInt
    }
  },
  mutateAndGetPayload: () => ({result: 1})
});

var simpleMutationWithThunkFields = mutationWithClientMutationId({
  name: 'SimpleMutationWithThunkFields',
  inputFields: () => ({
    inputData: {
      type: GraphQLInt
    }
  }),
  outputFields: () => ({
    result: {
      type: GraphQLInt
    }
  }),
  mutateAndGetPayload: ({ inputData }) => ({result: inputData})
});

var simplePromiseMutation = mutationWithClientMutationId({
  name: 'SimplePromiseMutation',
  inputFields: {},
  outputFields: {
    result: {
      type: GraphQLInt
    }
  },
  mutateAndGetPayload: () => Promise.resolve({result: 1})
});

var mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    simpleMutation: simpleMutation,
    simpleMutationWithThunkFields: simpleMutationWithThunkFields,
    simplePromiseMutation: simplePromiseMutation
  }
});

var schema = new GraphQLSchema({
  query: mutation,
  mutation: mutation
});

describe('mutationWithClientMutationId()', () => {
  it('requires an argument', async () => {
    var query = `
      mutation M {
        simpleMutation {
          result
        }
      }
    `;
    var result = await graphql(schema, query);
    expect(result.errors.length).to.equal(1);
    expect(result.errors[0].message).to.equal('Field \"simpleMutation\" argument \"input\" of type \"SimpleMutationInput!\" is required but not provided.');
  });

  it('returns the same client mutation ID', () => {
    var query = `
      mutation M {
        simpleMutation(input: {clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;
    var expected = {
      data: {
        simpleMutation: {
          result: 1,
          clientMutationId: 'abc'
        }
      }
    };
    return expect(graphql(schema, query)).to.become(expected);
  });

  it('Supports thunks as input and output fields', () => {
    var query = `
      mutation M {
        simpleMutationWithThunkFields(input: {inputData: 1234, clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;
    var expected = {
      data: {
        simpleMutationWithThunkFields: {
          result: 1234,
          clientMutationId: 'abc'
        }
      }
    };
    return expect(graphql(schema, query)).to.become(expected);
  });

  it('supports promise mutations', () => {
    var query = `
      mutation M {
        simplePromiseMutation(input: {clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;
    var expected = {
      data: {
        simplePromiseMutation: {
          result: 1,
          clientMutationId: 'abc'
        }
      }
    };
    return expect(graphql(schema, query)).to.become(expected);
  });

  describe('introspection', () => {
    it('contains correct input', () => {
      var query = `{
        __type(name: "SimpleMutationInput") {
          name
          kind
          inputFields {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }`;
      var expected = {
        __type: {
          name: 'SimpleMutationInput',
          kind: 'INPUT_OBJECT',
          inputFields: [
            {
              name: 'clientMutationId',
              type: {
                name: null,
                kind: 'NON_NULL',
                ofType: {
                  name: 'String',
                  kind: 'SCALAR'
                }
              }
            }
          ]
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('contains correct payload', () => {
      var query = `{
        __type(name: "SimpleMutationPayload") {
          name
          kind
          fields {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }`;
      var expected = {
        __type: {
          name: 'SimpleMutationPayload',
          kind: 'OBJECT',
          fields: [
            {
              name: 'result',
              type: {
                name: 'Int',
                kind: 'SCALAR',
                ofType: null
              }
            },
            {
              name: 'clientMutationId',
              type: {
                name: null,
                kind: 'NON_NULL',
                ofType: {
                  name: 'String',
                  kind: 'SCALAR'
                }
              }
            }
          ]
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('contains correct field', () => {
      var query = `{
        __schema {
          mutationType {
            fields {
              name
              args {
                name
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
              type {
                name
                kind
              }
            }
          }
        }
      }`;
      var expected = {
        __schema: {
          mutationType: {
            fields: [
              {
                name: 'simpleMutation',
                args: [
                  {
                    name: 'input',
                    type: {
                      name: null,
                      kind: 'NON_NULL',
                      ofType: {
                        name: 'SimpleMutationInput',
                        kind: 'INPUT_OBJECT'
                      }
                    },
                  }
                ],
                type: {
                  name: 'SimpleMutationPayload',
                  kind: 'OBJECT',
                }
              },
              {
                name: 'simpleMutationWithThunkFields',
                args: [
                  {
                    name: 'input',
                    type: {
                      name: null,
                      kind: 'NON_NULL',
                      ofType: {
                        name: 'SimpleMutationWithThunkFieldsInput',
                        kind: 'INPUT_OBJECT'
                      }
                    },
                  }
                ],
                type: {
                  name: 'SimpleMutationWithThunkFieldsPayload',
                  kind: 'OBJECT',
                }
              },
              {
                name: 'simplePromiseMutation',
                args: [
                  {
                    name: 'input',
                    type: {
                      name: null,
                      kind: 'NON_NULL',
                      ofType: {
                        name: 'SimplePromiseMutationInput',
                        kind: 'INPUT_OBJECT'
                      }
                    },
                  }
                ],
                type: {
                  name: 'SimplePromiseMutationPayload',
                  kind: 'OBJECT',
                }
              },
            ]
          }
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });
  });
});
