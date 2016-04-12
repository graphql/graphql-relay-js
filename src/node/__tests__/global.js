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
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql
} from 'graphql';

import {
  fromGlobalId,
  globalIdField,
  nodeDefinitions,
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
  '1': {  // eslint-disable-line quote-props
    photoId: 1,
    width: 300
  },
  '2': {  // eslint-disable-line quote-props
    photoId: 2,
    width: 400
  },
};

var postData = {
  '1': {  // eslint-disable-line quote-props
    id: 1,
    text: 'lorem'
  },
  '2': {  // eslint-disable-line quote-props
    id: 2,
    text: 'ipsum'
  },
};

var {nodeField, nodeInterface} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'User') {
      return userData[id];
    } else if (type === 'Photo') {
      return photoData[id];
    } else {
      return postData[id];
    }
  },
  (obj) => {
    if (obj.name) {
      return userType;
    } else if (obj.photoId) {
      return photoType;
    } else {
      return postType;
    }
  }
);

var userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: globalIdField('User'),
    name: {
      type: GraphQLString,
    },
  }),
  interfaces: [nodeInterface]
});

var photoType = new GraphQLObjectType({
  name: 'Photo',
  fields: () => ({
    id: globalIdField('Photo', (obj) => obj.photoId),
    width: {
      type: GraphQLInt,
    },
  }),
  interfaces: [nodeInterface]
});

var postType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: globalIdField(),
    text: {
      type: GraphQLString,
    },
  }),
  interfaces: [nodeInterface]
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    allObjects: {
      type: new GraphQLList(nodeInterface),
      resolve: () => [
        userData[1], userData[2],
        photoData[1], photoData[2],
        postData[1], postData[2],
      ]
    }
  })
});

var schema = new GraphQLSchema({
  query: queryType,
  types: [userType, photoType, postType]
});

describe('global ID fields', () => {
  it('gives different IDs', () => {
    var query = `{
      allObjects {
        id
      }
    }`;
    var expected = {
      allObjects: [
        {
          id: 'VXNlcjox'
        },
        {
          id: 'VXNlcjoy'
        },
        {
          id: 'UGhvdG86MQ=='
        },
        {
          id: 'UGhvdG86Mg=='
        },
        {
          id: 'UG9zdDox'
        },
        {
          id: 'UG9zdDoy'
        },
      ]
    };

    return expect(graphql(schema, query)).to.become({data: expected});
  });

  it('refetches the IDs', () => {
    var query = `{
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
    }`;
    var expected = {
      user: {
        id: 'VXNlcjox',
        name: 'John Doe'
      },
      photo: {
        id: 'UGhvdG86MQ==',
        width: 300
      },
      post: {
        id: 'UG9zdDox',
        text: 'lorem'
      }
    };

    return expect(graphql(schema, query)).to.become({data: expected});
  });
});
