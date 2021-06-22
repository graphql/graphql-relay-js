import type {
  GraphQLFieldConfig,
  GraphQLInterfaceType,
  GraphQLResolveInfo,
  GraphQLTypeResolver,
} from 'graphql';

// TS_SPECIFIC: This type is only exported by TypeScript
export interface GraphQLNodeDefinitions<TContext> {
  nodeInterface: GraphQLInterfaceType;
  nodeField: GraphQLFieldConfig<any, TContext>;
  nodesField: GraphQLFieldConfig<any, TContext>;
}

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
  fetchById: (
    id: string,
    context: TContext,
    info: GraphQLResolveInfo,
  ) => unknown,
  typeResolver?: GraphQLTypeResolver<any, TContext>,
): GraphQLNodeDefinitions<TContext>;

// TS_SPECIFIC: This type is only exported by TypeScript
export interface ResolvedGlobalId {
  type: string;
  id: string;
}

/**
 * Takes a type name and an ID specific to that type name, and returns a
 * "global ID" that is unique among all types.
 */
export function toGlobalId(type: string | number, id: string): string;

/**
 * Takes the "global ID" created by toGlobalID, and returns the type name and ID
 * used to create it.
 */
export function fromGlobalId(globalId: string): ResolvedGlobalId;

/**
 * Creates the configuration for an id field on a node, using `toGlobalId` to
 * construct the ID from the provided typename. The type-specific ID is fetched
 * by calling idFetcher on the object, or if not provided, by accessing the `id`
 * property on the object.
 */
export function globalIdField<TContext>(
  typeName?: string,
  idFetcher?: (
    obj: any,
    context: TContext,
    info: GraphQLResolveInfo,
  ) => string | number,
): GraphQLFieldConfig<any, TContext>;
