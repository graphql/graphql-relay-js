import { describe, it } from 'mocha';
import { expect } from 'chai';

import type { GraphQLFieldConfig } from 'graphql';
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  graphql,
  graphqlSync,
} from 'graphql';

import { mutationWithClientMutationId } from '../mutation';

function dummyResolve() {
  return { result: 1 };
}

function wrapInSchema(mutationFields: {
  [field: string]: GraphQLFieldConfig<any, any>,
}): GraphQLSchema {
  const queryType = new GraphQLObjectType({
    name: 'DummyQuery',
    fields: { dummy: { type: GraphQLInt } },
  });

  const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: mutationFields,
  });

  return new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
  });
}

describe('mutationWithClientMutationId()', () => {
  it('requires an argument', () => {
    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: dummyResolve,
    });
    const schema = wrapInSchema({ someMutation });
    const source = `
      mutation {
        someMutation {
          result
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      errors: [
        {
          message:
            'Field "someMutation" argument "input" of type "SomeMutationInput!" is required, but it was not provided.',
          locations: [{ line: 3, column: 9 }],
        },
      ],
    });
  });

  it('returns the same client mutation ID', () => {
    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: dummyResolve,
    });
    const schema = wrapInSchema({ someMutation });

    const source = `
      mutation {
        someMutation(input: {clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        someMutation: { result: 1, clientMutationId: 'abc' },
      },
    });
  });

  it('supports thunks as input and output fields', () => {
    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      inputFields: () => ({ inputData: { type: GraphQLInt } }),
      outputFields: () => ({ result: { type: GraphQLInt } }),
      mutateAndGetPayload: ({ inputData }) => ({ result: inputData }),
    });
    const schema = wrapInSchema({ someMutation });

    const source = `
      mutation {
        someMutation(input: { inputData: 1234, clientMutationId: "abc" }) {
          result
          clientMutationId
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        someMutation: { result: 1234, clientMutationId: 'abc' },
      },
    });
  });

  it('supports promise mutations', async () => {
    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: () => Promise.resolve({ result: 1 }),
    });
    const schema = wrapInSchema({ someMutation });

    const source = `
      mutation {
        someMutation(input: {clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;

    expect(await graphql({ schema, source })).to.deep.equal({
      data: {
        someMutation: { result: 1, clientMutationId: 'abc' },
      },
    });
  });

  it('can access rootValue', () => {
    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: (_params, _context, { rootValue }) => rootValue,
    });
    const schema = wrapInSchema({ someMutation });

    const source = `
      mutation {
        someMutation(input: {clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;
    const rootValue = { result: 1 };

    expect(graphqlSync({ schema, source, rootValue })).to.deep.equal({
      data: {
        someMutation: { result: 1, clientMutationId: 'abc' },
      },
    });
  });

  it('supports mutations returning null', () => {
    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: () => null,
    });
    const schema = wrapInSchema({ someMutation });

    const source = `
      mutation {
        someMutation(input: {clientMutationId: "abc"}) {
          result
          clientMutationId
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        someMutation: { result: null, clientMutationId: 'abc' },
      },
    });
  });

  describe('introspection', () => {
    const simpleMutation = mutationWithClientMutationId({
      name: 'SimpleMutation',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: dummyResolve,
    });

    const simpleMutationWithDescription = mutationWithClientMutationId({
      name: 'SimpleMutationWithDescription',
      description: 'Simple Mutation Description',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: dummyResolve,
    });

    const simpleMutationWithDeprecationReason = mutationWithClientMutationId({
      name: 'SimpleMutationWithDeprecationReason',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: dummyResolve,
      deprecationReason: 'Just because',
    });

    const schema = wrapInSchema({
      simpleMutation,
      simpleMutationWithDescription,
      simpleMutationWithDeprecationReason,
    });

    it('contains correct input', () => {
      const source = `
        {
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
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
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

    it('contains correct payload', () => {
      const source = `
        {
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
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
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

    it('contains correct field', () => {
      const source = `
        {
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
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
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
              ],
            },
          },
        },
      });
    });

    it('contains correct descriptions', () => {
      const source = `
        {
          __schema {
            mutationType {
              fields {
                name
                description
              }
            }
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
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
              ],
            },
          },
        },
      });
    });

    it('contains correct deprecation reasons', () => {
      const source = `
        {
          __schema {
            mutationType {
              fields(includeDeprecated: true) {
                name
                isDeprecated
                deprecationReason
              }
            }
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
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
              ],
            },
          },
        },
      });
    });
  });
});
