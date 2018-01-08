'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nodeDefinitions = nodeDefinitions;
exports.toGlobalId = toGlobalId;
exports.fromGlobalId = fromGlobalId;
exports.globalIdField = globalIdField;

var _graphql = require('graphql');

var _base = require('../utils/base64.js');

/**
 * Given a function to map from an ID to an underlying object, and a function
 * to map from an underlying object to the concrete GraphQLObjectType it
 * corresponds to, constructs a `Node` interface that objects can implement,
 * and a field config for a `node` root field.
 *
 * If the typeResolver is omitted, object resolution on the interface will be
 * handled with the `isTypeOf` method on object types, as with any GraphQL
 * interface without a provided `resolveType` method.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

function nodeDefinitions(idFetcher, typeResolver) {
  var nodeInterface = new _graphql.GraphQLInterfaceType({
    name: 'Node',
    description: 'An object with an ID',
    fields: function fields() {
      return {
        id: {
          type: new _graphql.GraphQLNonNull(_graphql.GraphQLID),
          description: 'The id of the object.'
        }
      };
    },
    resolveType: typeResolver
  });

  var nodeField = {
    name: 'node',
    description: 'Fetches an object given its ID',
    type: nodeInterface,
    args: {
      id: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLID),
        description: 'The ID of an object'
      }
    },
    resolve: function resolve(obj, _ref, context, info) {
      var id = _ref.id;
      return idFetcher(id, context, info);
    }
  };

  var nodesField = {
    name: 'nodes',
    description: 'Fetches objects given their IDs',
    type: new _graphql.GraphQLNonNull(new _graphql.GraphQLList(nodeInterface)),
    args: {
      ids: {
        type: new _graphql.GraphQLNonNull(new _graphql.GraphQLList(new _graphql.GraphQLNonNull(_graphql.GraphQLID))),
        description: 'The IDs of objects'
      }
    },
    resolve: function resolve(obj, _ref2, context, info) {
      var ids = _ref2.ids;
      return Promise.all(ids.map(function (id) {
        return Promise.resolve(idFetcher(id, context, info));
      }));
    }
  };

  return { nodeInterface: nodeInterface, nodeField: nodeField, nodesField: nodesField };
}

/**
 * Takes a type name and an ID specific to that type name, and returns a
 * "global ID" that is unique among all types.
 */
function toGlobalId(type, id) {
  return (0, _base.base64)([type, id].join(':'));
}

/**
 * Takes the "global ID" created by toGlobalID, and returns the type name and ID
 * used to create it.
 */
function fromGlobalId(globalId) {
  var unbasedGlobalId = (0, _base.unbase64)(globalId);
  var delimiterPos = unbasedGlobalId.indexOf(':');
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1)
  };
}

/**
 * Creates the configuration for an id field on a node, using `toGlobalId` to
 * construct the ID from the provided typename. The type-specific ID is fetched
 * by calling idFetcher on the object, or if not provided, by accessing the `id`
 * property on the object.
 */
function globalIdField(typeName, idFetcher) {
  return {
    name: 'id',
    description: 'The ID of an object',
    type: new _graphql.GraphQLNonNull(_graphql.GraphQLID),
    resolve: function resolve(obj, args, context, info) {
      return toGlobalId(typeName || info.parentType.name, idFetcher ? idFetcher(obj, context, info) : obj.id);
    }
  };
}