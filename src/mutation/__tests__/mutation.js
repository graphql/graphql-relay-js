// @flow strict

import { describe, it } from 'mocha';
import { expect } from 'chai';

import { GraphQLInt, GraphQLObjectType, GraphQLSchema, graphql } from 'graphql';

import { mutationWithClientMutationId } from '../mutation';

const simpleMutation = mutationWithClientMutationId({
  name: 'SimpleMutation',
  inputFields: {},
  outputFields: {
    result: {
      type: GraphQLInt,
    },
  },
  mutateAndGetPayload: () => ({ result: 1 }),
});

const simpleMutationWithDescription = mutationWithClientMutationId({
  name: 'SimpleMutationWithDescription',
  description: 'Simple Mutation Description',
  inputFields: {},
  outputFields: {
    result: {
      type: GraphQLInt,
    },
  },
  mutateAndGetPayload: () => ({ result: 1 }),
});

const simpleMutationWithDeprecationReason = mutationWithClientMutationId({
  name: 'SimpleMutationWithDeprecationReason',
  inputFields: {},
  outputFields: {
    result: {
      type: GraphQLInt,
    },
  },
  mutateAndGetPayload: () => ({ result: 1 }),
  deprecationReason: 'Just because',
});

const simpleMutationWithThunkFields = mutationWithClientMutationId({
  name: 'SimpleMutationWithThunkFields',
  inputFields: () => ({
    inputData: {
      type: GraphQLInt,
    },
  }),
  outputFields: () => ({
    result: {
      type: GraphQLInt,
    },
  }),
  mutateAndGetPayload: ({ inputData }) => ({ result: inputData }),
});

const simplePromiseMutation = mutationWithClientMutationId({
  name: 'SimplePromiseMutation',
  inputFields: {},
  outputFields: {
    result: {
      type: GraphQLInt,
    },
  },
  mutateAndGetPayload: () => Promise.resolve({ result: 1 }),
});

const simpleRootValueMutation = mutationWithClientMutationId({
  name: 'SimpleRootValueMutation',
  inputFields: {},
  outputFields: {
    result: {
      type: GraphQLInt,
    },
  },
  mutateAndGetPayload: (params, context, { rootValue }) => rootValue,
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    query: { type: queryType },
  }),
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    simpleMutation,
    simpleMutationWithDescription,
    simpleMutationWithDeprecationReason,
    simpleMutationWithThunkFields,
    simplePromiseMutation,
    simpleRootValueMutation,
  },
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

describe('mutationWithClientMutationId()', () => {
  it('requires an argument', async () => {
    const query = `
      mutation M {
        simpleMutation {
          result
        }
      }
    `;
    expect(await graphql(schema, query)).to.deep.equal({
      errors: [
        {
          message:
            'Field "simpleMutation" argument "input" of type ' +
            '"SimpleMutationInput!" is required but not provided.',
          locations: [{ line: 3, column: 9 }],
        },
      ],
    });
  });

  it('returns the same client mutation ID', async () => {
    const query = `
      mutation M {
        simpleMutation(input: {clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;

    expect(await graphql(schema, query)).to.deep.equal({
      data: {
        simpleMutation: {
          result: 1,
          clientMutationId: 'abc',
        },
      },
    });
  });

  it('supports thunks as input and output fields', async () => {
    const query = `
      mutation M {
        simpleMutationWithThunkFields(input: {
          inputData: 1234,
          clientMutationId: "abc"
        }) {
          result
          clientMutationId
        }
      }
    `;

    expect(await graphql(schema, query)).to.deep.equal({
      data: {
        simpleMutationWithThunkFields: {
          result: 1234,
          clientMutationId: 'abc',
        },
      },
    });
  });

  it('supports promise mutations', async () => {
    const query = `
      mutation M {
        simplePromiseMutation(input: {clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;

    expect(await graphql(schema, query)).to.deep.equal({
      data: {
        simplePromiseMutation: {
          result: 1,
          clientMutationId: 'abc',
        },
      },
    });
  });

  it('can access rootValue', async () => {
    const query = `
      mutation M {
        simpleRootValueMutation(input: {clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;

    expect(await graphql(schema, query, { result: 1 })).to.deep.equal({
      data: {
        simpleRootValueMutation: {
          result: 1,
          clientMutationId: 'abc',
        },
      },
    });
  });

  describe('introspection', () => {
    it('contains correct input', async () => {
      const query = `{
        __type(name: "SimpleMutationInput") {
          name
          kind
          inputFields {
            name
            type {
              name
              kind
            }
          }
        }
      }`;

      expect(await graphql(schema, query)).to.deep.equal({
        data: {
          __type: {
            name: 'SimpleMutationInput',
            kind: 'INPUT_OBJECT',
            inputFields: [
              {
                name: 'clientMutationId',
                type: {
                  name: 'String',
                  kind: 'SCALAR',
                },
              },
            ],
          },
        },
      });
    });

    it('contains correct payload', async () => {
      const query = `{
        __type(name: "SimpleMutationPayload") {
          name
          kind
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }`;

      expect(await graphql(schema, query)).to.deep.equal({
        data: {
          __type: {
            name: 'SimpleMutationPayload',
            kind: 'OBJECT',
            fields: [
              {
                name: 'result',
                type: {
                  name: 'Int',
                  kind: 'SCALAR',
                },
              },
              {
                name: 'clientMutationId',
                type: {
                  name: 'String',
                  kind: 'SCALAR',
                },
              },
            ],
          },
        },
      });
    });

    it('contains correct field', async () => {
      const query = `{
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

      expect(await graphql(schema, query)).to.deep.equal({
        data: {
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
                          kind: 'INPUT_OBJECT',
                        },
                      },
                    },
                  ],
                  type: {
                    name: 'SimpleMutationPayload',
                    kind: 'OBJECT',
                  },
                },
                {
                  name: 'simpleMutationWithDescription',
                  args: [
                    {
                      name: 'input',
                      type: {
                        name: null,
                        kind: 'NON_NULL',
                        ofType: {
                          name: 'SimpleMutationWithDescriptionInput',
                          kind: 'INPUT_OBJECT',
                        },
                      },
                    },
                  ],
                  type: {
                    name: 'SimpleMutationWithDescriptionPayload',
                    kind: 'OBJECT',
                  },
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
                          kind: 'INPUT_OBJECT',
                        },
                      },
                    },
                  ],
                  type: {
                    name: 'SimpleMutationWithThunkFieldsPayload',
                    kind: 'OBJECT',
                  },
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
                          kind: 'INPUT_OBJECT',
                        },
                      },
                    },
                  ],
                  type: {
                    name: 'SimplePromiseMutationPayload',
                    kind: 'OBJECT',
                  },
                },
                {
                  name: 'simpleRootValueMutation',
                  args: [
                    {
                      name: 'input',
                      type: {
                        name: null,
                        kind: 'NON_NULL',
                        ofType: {
                          name: 'SimpleRootValueMutationInput',
                          kind: 'INPUT_OBJECT',
                        },
                      },
                    },
                  ],
                  type: {
                    name: 'SimpleRootValueMutationPayload',
                    kind: 'OBJECT',
                  },
                },
              ],
            },
          },
        },
      });
    });

    it('contains correct descriptions', async () => {
      const query = `{
        __schema {
          mutationType {
            fields {
              name
              description
            }
          }
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          __schema: {
            mutationType: {
              fields: [
                {
                  name: 'simpleMutation',
                  description: null,
                },
                {
                  name: 'simpleMutationWithDescription',
                  description: 'Simple Mutation Description',
                },
                {
                  name: 'simpleMutationWithThunkFields',
                  description: null,
                },
                {
                  name: 'simplePromiseMutation',
                  description: null,
                },
                {
                  name: 'simpleRootValueMutation',
                  description: null,
                },
              ],
            },
          },
        },
      });
    });

    it('contains correct deprecation reasons', async () => {
      const query = `{
        __schema {
          mutationType {
            fields(includeDeprecated: true) {
              name
              isDeprecated
              deprecationReason
            }
          }
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          __schema: {
            mutationType: {
              fields: [
                {
                  name: 'simpleMutation',
                  isDeprecated: false,
                  deprecationReason: null,
                },
                {
                  name: 'simpleMutationWithDescription',
                  isDeprecated: false,
                  deprecationReason: null,
                },
                {
                  name: 'simpleMutationWithDeprecationReason',
                  isDeprecated: true,
                  deprecationReason: 'Just because',
                },
                {
                  name: 'simpleMutationWithThunkFields',
                  isDeprecated: false,
                  deprecationReason: null,
                },
                {
                  name: 'simplePromiseMutation',
                  isDeprecated: false,
                  deprecationReason: null,
                },
                {
                  name: 'simpleRootValueMutation',
                  isDeprecated: false,
                  deprecationReason: null,
                },
              ],
            },
          },
        },
      });
    });
  });
});
