import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphqlSync,
  printSchema,
} from 'graphql';

import { dedent } from '../../__testUtils__/dedent';

import { nodeDefinitions } from '../node';

const userData = [
  {
    id: '1',
    name: 'John Doe',
  },
  {
    id: '2',
    name: 'Jane Smith',
  },
];

const photoData = [
  {
    id: '3',
    width: 300,
  },
  {
    id: '4',
    width: 400,
  },
];

const { nodeField, nodesField, nodeInterface } = nodeDefinitions(
  (id, _context, info) => {
    expect(info.schema).to.equal(schema);
    return (
      userData.find((obj) => obj.id === id) ??
      photoData.find((obj) => obj.id === id)
    );
  },
  (obj) => {
    if (userData.includes(obj)) {
      return userType.name;
    }
    // istanbul ignore else (Can't be reached)
    if (photoData.includes(obj)) {
      return photoType.name;
    }
  },
);

const userType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  interfaces: [nodeInterface],
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
  }),
});

const photoType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Photo',
  interfaces: [nodeInterface],
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    width: {
      type: GraphQLInt,
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    nodes: nodesField,
  }),
});

const schema = new GraphQLSchema({
  query: queryType,
  types: [nodeInterface, userType, photoType],
});

describe('Node interface and fields', () => {
  describe('Ability to refetch', () => {
    it('gets the correct ID for users', () => {
      const source = `
        {
          node(id: "1") {
            id
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          node: { id: '1' },
        },
      });
    });

    it('gets the correct IDs for users', () => {
      const source = `
        {
          nodes(ids: ["1", "2"]) {
            id
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          nodes: [{ id: '1' }, { id: '2' }],
        },
      });
    });

    it('gets the correct ID for photos', () => {
      const source = `
        {
          node(id: "4") {
            id
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          node: { id: '4' },
        },
      });
    });

    it('gets the correct IDs for photos', () => {
      const source = `
        {
          nodes(ids: ["3", "4"]) {
            id
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          nodes: [{ id: '3' }, { id: '4' }],
        },
      });
    });

    it('gets the correct IDs for multiple types', () => {
      const source = `
        {
          nodes(ids: ["1", "3"]) {
            id
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          nodes: [{ id: '1' }, { id: '3' }],
        },
      });
    });

    it('gets the correct name for users', () => {
      const source = `
        {
          node(id: "1") {
            id
            ... on User {
              name
            }
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          node: {
            id: '1',
            name: 'John Doe',
          },
        },
      });
    });

    it('gets the correct width for photos', () => {
      const source = `
        {
          node(id: "4") {
            id
            ... on Photo {
              width
            }
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          node: {
            id: '4',
            width: 400,
          },
        },
      });
    });

    it('gets the correct type name for users', () => {
      const source = `
        {
          node(id: "1") {
            id
            __typename
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          node: {
            id: '1',
            __typename: 'User',
          },
        },
      });
    });

    it('gets the correct type name for photos', () => {
      const source = `
        {
          node(id: "4") {
            id
            __typename
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          node: {
            id: '4',
            __typename: 'Photo',
          },
        },
      });
    });

    it('ignores photo fragments on user', () => {
      const source = `
        {
          node(id: "1") {
            id
            ... on Photo {
              width
            }
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          node: { id: '1' },
        },
      });
    });

    it('returns null for bad IDs', () => {
      const source = `
        {
          node(id: "5") {
            id
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          node: null,
        },
      });
    });

    it('returns nulls for bad IDs', () => {
      const source = `
        {
          nodes(ids: ["3", "5"]) {
            id
          }
        }
      `;

      expect(graphqlSync({ schema, source })).to.deep.equal({
        data: {
          nodes: [{ id: '3' }, null],
        },
      });
    });
  });

  it('generates correct types', () => {
    expect(printSchema(schema)).to.deep.equal(dedent`
      """An object with an ID"""
      interface Node {
        """The id of the object."""
        id: ID!
      }

      type User implements Node {
        id: ID!
        name: String
      }

      type Photo implements Node {
        id: ID!
        width: Int
      }

      type Query {
        """Fetches an object given its ID"""
        node(
          """The ID of an object"""
          id: ID!
        ): Node

        """Fetches objects given their IDs"""
        nodes(
          """The IDs of objects"""
          ids: [ID!]!
        ): [Node]!
      }
    `);
  });
});
