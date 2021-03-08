// @flow strict

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
  '1': {
    photoId: 1,
    width: 300,
  },
  '2': {
    photoId: 2,
    width: 400,
  },
};

const postData = {
  '1': {
    id: 1,
    text: 'lorem',
  },
  '2': {
    id: 2,
    text: 'ipsum',
  },
};

const { nodeField, nodeInterface } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    switch (type) {
      case 'User':
        return userData[id];
      case 'Photo':
        return photoData[id];
      case 'Post':
        return postData[id];
    }
  },
  (obj) => {
    if (obj.name) {
      return userType;
    }
    if (obj.photoId) {
      return photoType;
    }

    // istanbul ignore else (Can't be reached)
    if (obj.text) {
      return postType;
    }
  },
);

const userType = new GraphQLObjectType({
  name: 'User',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField('User'),
    name: {
      type: GraphQLString,
    },
  }),
});

const photoType = new GraphQLObjectType({
  name: 'Photo',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField('Photo', (obj) => obj.photoId),
    width: {
      type: GraphQLInt,
    },
  }),
});

const postType = new GraphQLObjectType({
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
      resolve: () => [
        userData[1],
        userData[2],
        photoData[1],
        photoData[2],
        postData[1],
        postData[2],
      ],
    },
  }),
});

const schema = new GraphQLSchema({
  query: queryType,
  types: [userType, photoType, postType],
});

describe('global ID fields', () => {
  it('gives different IDs', () => {
    const query = `
      {
        allObjects {
          id
        }
      }
    `;

    expect(graphqlSync(schema, query)).to.deep.equal({
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

  it('refetches the IDs', () => {
    const query = `
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

    expect(graphqlSync(schema, query)).to.deep.equal({
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
