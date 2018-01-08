'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pluralIdentifyingRootField = pluralIdentifyingRootField;

var _graphql = require('graphql');

function pluralIdentifyingRootField(config) {
  var inputArgs = {};
  var inputType = config.inputType;
  if (inputType instanceof _graphql.GraphQLNonNull) {
    inputType = inputType.ofType;
  }
  inputArgs[config.argName] = {
    type: new _graphql.GraphQLNonNull(new _graphql.GraphQLList(new _graphql.GraphQLNonNull(inputType)))
  };
  return {
    description: config.description,
    type: new _graphql.GraphQLList(config.outputType),
    args: inputArgs,
    resolve: function resolve(obj, args, context, info) {
      var inputs = args[config.argName];
      return Promise.all(inputs.map(function (input) {
        return Promise.resolve(config.resolveSingleInput(input, context, info));
      }));
    }
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */