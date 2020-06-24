// @flow

import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from 'graphql';

import { nodeDefinitions } from '../node';

const userData = {
  '1': {
    id: 1,
    name: 'John Doe',
  },
  '2': {
    id: 2,
    name: 'Jane Smith',
  },
};

const photoData = {
  '3': {
    id: 3,
    width: 300,
  },
  '4': {
    id: 4,
    width: 400,
  },
};

const { nodeField, nodesField, nodeInterface } = nodeDefinitions(
  (id, context, info) => {
    expect(info.schema).to.equal(schema);
    if (userData[id]) {
      return userData[id];
    }
    if (photoData[id]) {
      return photoData[id];
    }
  },
  (obj) => {
    if (userData[obj.id]) {
      return userType;
    }
    if (photoData[obj.id]) {
      return photoType;
    }
  },
);

const userType = new GraphQLObjectType({
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

const photoType = new GraphQLObjectType({
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
  types: [userType, photoType],
});

describe('Node interface and fields', () => {
  describe('refetchability', () => {
    it('gets the correct ID for users', async () => {
      const query = `{
        node(id: "1") {
          id
        }
      }`;

      expect(await graphql(schema, query)).to.deep.equal({
        data: {
          node: {
            id: '1',
          },
        },
      });
    });

    it('gets the correct IDs for users', async () => {
      const query = `{
        nodes(ids: ["1", "2"]) {
          id
        }
      }`;

      expect(await graphql(schema, query)).to.deep.equal({
        data: {
          nodes: [
            {
              id: '1',
            },
            {
              id: '2',
            },
          ],
        },
      });
    });

    it('gets the correct ID for photos', async () => {
      const query = `{
        node(id: "4") {
          id
        }
      }`;

      expect(await graphql(schema, query)).to.deep.equal({
        data: {
          node: {
            id: '4',
          },
        },
      });
    });

    it('gets the correct IDs for photos', async () => {
      const query = `{
        nodes(ids: ["3", "4"]) {
          id
        }
      }`;

      expect(await graphql(schema, query)).to.deep.equal({
        data: {
          nodes: [
            {
              id: '3',
            },
            {
              id: '4',
            },
          ],
        },
      });
    });

    it('gets the correct IDs for multiple types', async () => {
      const query = `{
        nodes(ids: ["1", "3"]) {
          id
        }
      }`;

      expect(await graphql(schema, query)).to.deep.equal({
        data: {
          nodes: [
            {
              id: '1',
            },
            {
              id: '3',
            },
          ],
        },
      });
    });

    it('gets the correct name for users', async () => {
      const query = `{
        node(id: "1") {
          id
          ... on User {
            name
          }
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          node: {
            id: '1',
            name: 'John Doe',
          },
        },
      });
    });

    it('gets the correct width for photos', async () => {
      const query = `{
        node(id: "4") {
          id
          ... on Photo {
            width
          }
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          node: {
            id: '4',
            width: 400,
          },
        },
      });
    });

    it('gets the correct type name for users', async () => {
      const query = `{
        node(id: "1") {
          id
          __typename
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          node: {
            id: '1',
            __typename: 'User',
          },
        },
      });
    });

    it('gets the correct type name for photos', async () => {
      const query = `{
        node(id: "4") {
          id
          __typename
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          node: {
            id: '4',
            __typename: 'Photo',
          },
        },
      });
    });

    it('ignores photo fragments on user', async () => {
      const query = `{
        node(id: "1") {
          id
          ... on Photo {
            width
          }
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          node: {
            id: '1',
          },
        },
      });
    });

    it('returns null for bad IDs', async () => {
      const query = `{
        node(id: "5") {
          id
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          node: null,
        },
      });
    });

    it('returns nulls for bad IDs', async () => {
      const query = `{
        nodes(ids: ["3", "5"]) {
          id
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          nodes: [
            {
              id: '3',
            },
            null,
          ],
        },
      });
    });
  });

  describe('introspection', () => {
    it('has correct node interface', async () => {
      const query = `{
        __type(name: "Node") {
          name
          kind
          fields {
            name
            type {
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          __type: {
            name: 'Node',
            kind: 'INTERFACE',
            fields: [
              {
                name: 'id',
                type: {
                  kind: 'NON_NULL',
                  ofType: {
                    name: 'ID',
                    kind: 'SCALAR',
                  },
                },
              },
            ],
          },
        },
      });
    });

    it('has correct node and nodes root fields', async () => {
      const query = `{
        __schema {
          queryType {
            fields {
              name
              type {
                name
                kind
              }
              args {
                name
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
        }
      }`;

      return expect(await graphql(schema, query)).to.deep.equal({
        data: {
          __schema: {
            queryType: {
              fields: [
                {
                  name: 'node',
                  type: {
                    name: 'Node',
                    kind: 'INTERFACE',
                  },
                  args: [
                    {
                      name: 'id',
                      type: {
                        kind: 'NON_NULL',
                        ofType: {
                          name: 'ID',
                          kind: 'SCALAR',
                        },
                      },
                    },
                  ],
                },
                {
                  name: 'nodes',
                  type: {
                    name: null,
                    kind: 'NON_NULL',
                  },
                  args: [
                    {
                      name: 'ids',
                      type: {
                        kind: 'NON_NULL',
                        ofType: {
                          name: null,
                          kind: 'LIST',
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      });
    });
  });
});
