import { describe, it } from 'mocha';
import { expect } from 'chai';

import type { GraphQLFieldConfig } from 'graphql';
import {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  graphql,
  graphqlSync,
  printSchema,
} from 'graphql';

import { dedent } from '../../__testUtils__/dedent';

import { mutationWithClientMutationId } from '../mutation';

function dummyResolve() {
  return { result: 1 };
}

function wrapInSchema(mutationFields: {
  [field: string]: GraphQLFieldConfig<any, any>,
}): GraphQLSchema {
  const queryType = new GraphQLObjectType({
    name: 'Query',
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

  it('generates correct types', () => {
    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      description: 'Some Mutation Description',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: dummyResolve,
      deprecationReason: 'Just because',
    });

    const schema = wrapInSchema({ someMutation });

    // FIXME remove trimEnd after we update to `graphql@16.0.0`
    expect(printSchema(schema).trimEnd()).to.deep.equal(dedent`
      type Query {
        dummy: Int
      }

      type Mutation {
        """Some Mutation Description"""
        someMutation(input: SomeMutationInput!): SomeMutationPayload @deprecated(reason: "Just because")
      }

      type SomeMutationPayload {
        result: Int
        clientMutationId: String
      }

      input SomeMutationInput {
        clientMutationId: String
      }
    `);
  });
});
