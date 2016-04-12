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
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql
} from 'graphql';

import {
  nodeDefinitions
} from '../node';

var userData = {
  '1': {  // eslint-disable-line quote-props
    id: 1,
    name: 'John Doe'
  },
  '2': {  // eslint-disable-line quote-props
    id: 2,
    name: 'Jane Smith'
  },
};

var photoData = {
  '3': {  // eslint-disable-line quote-props
    id: 3,
    width: 300
  },
  '4': {  // eslint-disable-line quote-props
    id: 4,
    width: 400
  },
};

var {nodeField, nodeInterface} = nodeDefinitions(
  (id, context, info) => {
    expect(info.schema).to.equal(schema);
    if (userData[id]) {
      return userData[id];
    } else {
      return photoData[id];
    }
  },
  (obj) => {
    if (userData[obj.id]) {
      return userType;
    } else {
      return photoType;
    }
  }
);

var userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
  }),
  interfaces: [nodeInterface]
});

var photoType = new GraphQLObjectType({
  name: 'Photo',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    width: {
      type: GraphQLInt,
    },
  }),
  interfaces: [nodeInterface]
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField
  })
});

var schema = new GraphQLSchema({
  query: queryType,
  types: [userType, photoType]
});

describe('Node interface and fields', () => {
  describe('refetchability', () => {
    it('gets the correct ID for users', () => {
      var query = `{
        node(id: "1") {
          id
        }
      }`;
      var expected = {
        node: {
          id: '1',
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('gets the correct ID for photos', () => {
      var query = `{
        node(id: "4") {
          id
        }
      }`;
      var expected = {
        node: {
          id: '4',
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('gets the correct name for users', () => {
      var query = `{
        node(id: "1") {
          id
          ... on User {
            name
          }
        }
      }`;
      var expected = {
        node: {
          id: '1',
          name: 'John Doe',
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('gets the correct width for photos', () => {
      var query = `{
        node(id: "4") {
          id
          ... on Photo {
            width
          }
        }
      }`;
      var expected = {
        node: {
          id: '4',
          width: 400,
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('gets the correct type name for users', () => {
      var query = `{
        node(id: "1") {
          id
          __typename
        }
      }`;
      var expected = {
        node: {
          id: '1',
          __typename: 'User',
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('gets the correct type name for photos', () => {
      var query = `{
        node(id: "4") {
          id
          __typename
        }
      }`;
      var expected = {
        node: {
          id: '4',
          __typename: 'Photo',
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('ignores photo fragments on user', () => {
      var query = `{
        node(id: "1") {
          id
          ... on Photo {
            width
          }
        }
      }`;
      var expected = {
        node: {
          id: '1',
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('returns null for bad IDs', () => {
      var query = `{
        node(id: "5") {
          id
        }
      }`;
      var expected = {
        node: null
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });
  });

  describe('introspection', () => {
    it('has correct node interface', () => {
      var query = `{
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
      var expected = {
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
                  kind: 'SCALAR'
                }
              }
            }
          ]
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });

    it('has correct node root field', () => {
      var query = `{
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
      var expected = {
        __schema: {
          queryType: {
            fields: [
              {
                name: 'node',
                type: {
                  name: 'Node',
                  kind: 'INTERFACE'
                },
                args: [
                  {
                    name: 'id',
                    type: {
                      kind: 'NON_NULL',
                      ofType: {
                        name: 'ID',
                        kind: 'SCALAR'
                      }
                    }
                  }
                ]
              }
            ]
          }
        }
      };

      return expect(graphql(schema, query)).to.become({data: expected});
    });
  });
});
