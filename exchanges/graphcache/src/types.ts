import { TypedDocumentNode } from '@urql/core';
import { GraphQLError, DocumentNode, FragmentDefinitionNode } from 'graphql';

// Helper types
export type NullArray<T> = Array<null | T>;

export interface Fragments {
  [fragmentName: string]: void | FragmentDefinitionNode;
}

// Scalar types are not entities as part of response data
export type Primitive = null | number | boolean | string;

export interface ScalarObject {
  __typename?: never;
  [key: string]: any;
}

export type Scalar = Primitive | ScalarObject;

export interface SystemFields {
  __typename: string;
  _id?: string | number | null;
  id?: string | number | null;
}

export type EntityField = undefined | Scalar | Scalar[];
export type DataField = Scalar | Scalar[] | Data | NullArray<Data>;

export interface DataFields {
  [fieldName: string]: DataField;
}

export interface Variables {
  [name: string]: Scalar | Scalar[] | Variables | NullArray<Variables>;
}

export type Data = SystemFields & DataFields;
export type Link<Key = string> = null | Key | NullArray<Key>;
export type ResolvedLink = Link<Data>;
export type Connection = [Variables, string];

export interface FieldInfo {
  fieldKey: string;
  fieldName: string;
  arguments: Variables | null;
}

export interface KeyInfo {
  entityKey: string;
  fieldKey: string;
}

// This is an input operation
export interface OperationRequest {
  query: DocumentNode | TypedDocumentNode<any, any>;
  variables?: any;
}

export interface ResolveInfo {
  parent: Data;
  parentTypeName: string;
  parentKey: string;
  parentFieldKey: string;
  fieldName: string;
  fragments: Fragments;
  variables: Variables;
  error: GraphQLError | undefined;
  partial?: boolean;
  optimistic?: boolean;
  __internal?: unknown;
}

export interface QueryInput<T = Data, V = Variables> {
  query: string | DocumentNode | TypedDocumentNode<T, V>;
  variables?: V;
}

export interface Cache {
  /** keyOfEntity() returns the key for an entity or null if it's unkeyable */
  keyOfEntity(data: Data | null | string): string | null;

  /** keyOfField() returns the key for a field */
  keyOfField(
    fieldName: string,
    args?: Variables | null | undefined
  ): string | null;

  /** resolve() retrieves the value (or link) of a field on any entity, given a partial/keyable entity or an entity key */
  resolve(
    entity: Data | string | null,
    fieldName: string,
    args?: Variables
  ): DataField;

  /** @deprecated use resolve() instead */
  resolveFieldByKey(entity: Data | string | null, fieldKey: string): DataField;

  /** inspectFields() retrieves all known fields for a given entity */
  inspectFields(entity: Data | string | null): FieldInfo[];

  /** invalidate() invalidates an entity or a specific field of an entity */
  invalidate(
    entity: Data | string | null,
    fieldName?: string,
    args?: Variables
  ): void;

  /** updateQuery() can be used to update the data of a given query using an updater function */
  updateQuery<T = Data, V = Variables>(
    input: QueryInput<T, V>,
    updater: (data: T | null) => T | null
  ): void;

  /** readQuery() retrieves the data for a given query */
  readQuery<T = Data, V = Variables>(input: QueryInput<T, V>): T | null;

  /** readFragment() retrieves the data for a given fragment, given a partial/keyable entity or an entity key */
  readFragment<T = Data, V = Variables>(
    fragment: DocumentNode | TypedDocumentNode<T, V>,
    entity: string | Data | T,
    variables?: V
  ): T | null;

  /** writeFragment() can be used to update the data of a given fragment, given an entity that is supposed to be written using the fragment */
  writeFragment<T = Data, V = Variables>(
    fragment: DocumentNode | TypedDocumentNode<T, V>,
    data: T,
    variables?: V
  ): void;

  link(
    entity: Data | string,
    field: string,
    fieldArgs: Variables | null,
    entities: Data | Data[],
  ): void;

  link(
    entity: Data | string,
    field: string,
    entities: Data | Data[],
  ): void;
}

type ResolverResult =
  | DataField
  | (DataFields & { __typename?: string })
  | null
  | undefined;

// Cache resolvers are user-defined to overwrite an entity field result
export type Resolver = (
  parent: Data,
  args: Variables,
  cache: Cache,
  info: ResolveInfo
) => ResolverResult;

export interface ResolverConfig {
  [typeName: string]: {
    [fieldName: string]: Resolver;
  };
}

export type UpdateResolver = (
  result: Data,
  args: Variables,
  cache: Cache,
  info: ResolveInfo
) => void;

export type KeyGenerator = (data: Data) => null | string;

export interface UpdatesConfig {
  Mutation: {
    [fieldName: string]: UpdateResolver;
  };
  Subscription: {
    [fieldName: string]: UpdateResolver;
  };
}

export type OptimisticMutationResolver = (
  vars: Variables,
  cache: Cache,
  info: ResolveInfo
) => null | Data | NullArray<Data>;

export interface OptimisticMutationConfig {
  [mutationFieldName: string]: OptimisticMutationResolver;
}

export interface KeyingConfig {
  [typename: string]: KeyGenerator;
}

export type SerializedEntry = EntityField | Connection[] | Link;

export interface SerializedEntries {
  [key: string]: string | undefined;
}

export interface SerializedRequest {
  query: string;
  variables?: object;
}

export interface StorageAdapter {
  readData(): Promise<SerializedEntries>;
  writeData(delta: SerializedEntries): Promise<any>;
  readMetadata?(): Promise<null | SerializedRequest[]>;
  writeMetadata?(json: SerializedRequest[]): void;
  onOnline?(cb: () => void): any;
}

export type Dependencies = Record<string, true>;

/** The type of cache operation being executed. */
export type OperationType = 'read' | 'write';
