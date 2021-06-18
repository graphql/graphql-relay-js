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

  /* FIXME fail because of this https://github.com/graphql/graphql-js/pull/3243#issuecomment-919510590
  it.only('JS specific: handles `then` as field name', async () => {
    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      inputFields: {},
      outputFields: {
        result: {
          type: new GraphQLObjectType({
            name: 'Payload',
            fields: {
              then: { type: GraphQLString },
            },
          }),
        },
      },
      mutateAndGetPayload() {
        return {
          then() {
            return new Date(0);
          }
        };
      },
    });
    const schema = wrapInSchema({ someMutation });

    const source = `
      mutation {
        someMutation(input: {clientMutationId: "abc"}) {
          clientMutationId
          result { then }
        }
      }
    `;

    expect(await graphql({ schema, source })).to.deep.equal({
      data: {
        someMutation: {
          clientMutationId: 'abc',
          result: {
            then: '',
          },
        },
      },
    });
  });
  */

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
      data: { someMutation: null },
    });
  });

  it('supports mutations returning custom classes', () => {
    class SomeClass {
      getSomeGeneratedData() {
        return 1;
      }
    }

    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      inputFields: {},
      outputFields: {
        result: {
          type: GraphQLInt,
          resolve: (obj) => obj.getSomeGeneratedData(),
        },
      },
      mutateAndGetPayload: () => new SomeClass(),
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

  it('generates correct types', () => {
    const description = 'Some Mutation Description';
    const deprecationReason = 'Just because';
    const extensions = Object.freeze({});

    const someMutationField = mutationWithClientMutationId({
      name: 'SomeMutation',
      description,
      deprecationReason,
      extensions,
      inputFields: {},
      outputFields: {},
      mutateAndGetPayload: dummyResolve,
    });

    expect(someMutationField).to.include({
      description,
      deprecationReason,
      extensions,
    });
  });

  it('generates correct types', () => {
    const someMutation = mutationWithClientMutationId({
      name: 'SomeMutation',
      inputFields: {},
      outputFields: {
        result: { type: GraphQLInt },
      },
      mutateAndGetPayload: dummyResolve,
    });

    const schema = wrapInSchema({ someMutation });

    // FIXME remove trimEnd after we update to `graphql@16.0.0`
    expect(printSchema(schema).trimEnd()).to.deep.equal(dedent`
      type Query {
        dummy: Int
      }

      type Mutation {
        someMutation(input: SomeMutationInput!): SomeMutationPayload
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
