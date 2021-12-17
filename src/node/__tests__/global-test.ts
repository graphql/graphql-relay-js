import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphqlSync,
} from 'graphql';

import { fromGlobalId, globalIdField, nodeDefinitions } from '../node';

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
    photoId: '1',
    width: 300,
  },
  {
    photoId: '2',
    width: 400,
  },
];

const postData = [
  {
    id: '1',
    text: 'lorem',
  },
  {
    id: '2',
    text: 'ipsum',
  },
];

const { nodeField, nodeInterface } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    switch (type) {
      case 'User':
        return userData.find((obj) => obj.id === id);
      case 'Photo':
        return photoData.find((obj) => obj.photoId === id);
      case 'Post':
        return postData.find((obj) => obj.id === id);
    }
  },
  (obj) => {
    if (obj.name) {
      return userType.name;
    }
    if (obj.photoId) {
      return photoType.name;
    }

    // istanbul ignore else (Can't be reached)
    if (obj.text) {
      return postType.name;
    }
  },
);

const userType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField('User'),
    name: {
      type: GraphQLString,
    },
  }),
});

const photoType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Photo',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField('Photo', (obj) => obj.photoId),
    width: {
      type: GraphQLInt,
    },
  }),
});

const postType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField(),
    text: {
      type: GraphQLString,
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    allObjects: {
      type: new GraphQLList(nodeInterface),
      resolve: () => [...userData, ...photoData, ...postData],
    },
  }),
});

const schema = new GraphQLSchema({
  query: queryType,
  types: [userType, photoType, postType],
});

describe('global ID fields', () => {
  it('gives different IDs', () => {
    const source = `
      {
        allObjects {
          id
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        allObjects: [
          { id: 'VXNlcjox' },
          { id: 'VXNlcjoy' },
          { id: 'UGhvdG86MQ==' },
          { id: 'UGhvdG86Mg==' },
          { id: 'UG9zdDox' },
          { id: 'UG9zdDoy' },
        ],
      },
    });
  });

  it('allows to refetch the IDs', () => {
    const source = `
      {
        user: node(id: "VXNlcjox") {
          id
          ... on User {
            name
          }
        },
        photo: node(id: "UGhvdG86MQ==") {
          id
          ... on Photo {
            width
          }
        },
        post: node(id: "UG9zdDox") {
          id
          ... on Post {
            text
          }
        }
      }
    `;

    expect(graphqlSync({ schema, source })).to.deep.equal({
      data: {
        user: {
          id: 'VXNlcjox',
          name: 'John Doe',
        },
        photo: {
          id: 'UGhvdG86MQ==',
          width: 300,
        },
        post: {
          id: 'UG9zdDox',
          text: 'lorem',
        },
      },
    });
  });
});
