// @flow strict

import {
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

import type {
  GraphQLFieldConfig,
  GraphQLResolveInfo,
  GraphQLTypeResolver,
} from 'graphql';

import { base64, unbase64 } from '../utils/base64';

type GraphQLNodeDefinitions<TContext> = {|
  nodeInterface: GraphQLInterfaceType,
  nodeField: GraphQLFieldConfig<mixed, TContext>,
  nodesField: GraphQLFieldConfig<mixed, TContext>,
|};

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
export function nodeDefinitions<TContext>(
  idFetcher: (id: string, context: TContext, info: GraphQLResolveInfo) => any,
  typeResolver?: GraphQLTypeResolver<any, TContext>,
): GraphQLNodeDefinitions<TContext> {
  const nodeInterface = new GraphQLInterfaceType({
    name: 'Node',
    description: 'An object with an ID',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the object.',
      },
    }),
    resolveType: typeResolver,
  });

  const nodeField = {
    description: 'Fetches an object given its ID',
    type: nodeInterface,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The ID of an object',
      },
    },
    resolve: (_obj, { id }, context, info) => idFetcher(id, context, info),
  };

  const nodesField = {
    description: 'Fetches objects given their IDs',
    type: new GraphQLNonNull(new GraphQLList(nodeInterface)),
    args: {
      ids: {
        type: new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(GraphQLID)),
        ),
        description: 'The IDs of objects',
      },
    },
    resolve: (_obj, { ids }, context, info) =>
      ids.map((id) => idFetcher(id, context, info)),
  };

  return { nodeInterface, nodeField, nodesField };
}

type ResolvedGlobalId = {|
  type: string,
  id: string,
|};

/**
 * Takes a type name and an ID specific to that type name, and returns a
 * "global ID" that is unique among all types.
 */
export function toGlobalId(type: string, id: string): string {
  return base64([type, id].join(':'));
}

/**
 * Takes the "global ID" created by toGlobalID, and returns the type name and ID
 * used to create it.
 */
export function fromGlobalId(globalId: string): ResolvedGlobalId {
  const unbasedGlobalId = unbase64(globalId);
  const delimiterPos = unbasedGlobalId.indexOf(':');
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1),
  };
}

/**
 * Creates the configuration for an id field on a node, using `toGlobalId` to
 * construct the ID from the provided typename. The type-specific ID is fetched
 * by calling idFetcher on the object, or if not provided, by accessing the `id`
 * property on the object.
 */
export function globalIdField(
  typeName?: string,
  idFetcher?: (object: any, context: any, info: GraphQLResolveInfo) => string,
): GraphQLFieldConfig<any, mixed> {
  return {
    description: 'The ID of an object',
    type: new GraphQLNonNull(GraphQLID),
    resolve: (obj, _args, context, info) =>
      toGlobalId(
        typeName ?? info.parentType.name,
        idFetcher ? idFetcher(obj, context, info) : obj.id,
      ),
  };
}
