/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { GraphQLResolveInfo } from 'graphql';
import type { CatalogSong, CatalogReport } from '../catalog.js';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CatalogFacet = {
  __typename?: 'CatalogFacet';
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  songCount: Scalars['Int']['output'];
};

export type CatalogFacets = {
  __typename?: 'CatalogFacets';
  artists: Array<CatalogFacet>;
  genres: Array<CatalogFacet>;
};

export type FlowTrigger = {
  __typename?: 'FlowTrigger';
  description: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  catalog: CatalogFacets;
  report?: Maybe<Report>;
  song?: Maybe<Song>;
  songs: SongPage;
};


export type QueryReportArgs = {
  slug: Scalars['ID']['input'];
};


export type QuerySongArgs = {
  slug: Scalars['ID']['input'];
};


export type QuerySongsArgs = {
  artist?: InputMaybe<Scalars['String']['input']>;
  genre?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type Report = {
  __typename?: 'Report';
  contributor: Scalars['String']['output'];
  dateAdded: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  markdown: Scalars['String']['output'];
  overallFlowRating: Scalars['Int']['output'];
  sourceFile: Scalars['String']['output'];
  timeToFlowSeconds: Scalars['Int']['output'];
};

export type Song = {
  __typename?: 'Song';
  artist: Scalars['String']['output'];
  artistSlug: Scalars['String']['output'];
  bpm?: Maybe<Scalars['String']['output']>;
  dateAdded: Scalars['String']['output'];
  description: Scalars['String']['output'];
  genre: Scalars['String']['output'];
  genreSlug: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  key?: Maybe<Scalars['String']['output']>;
  links: Array<SongLink>;
  overallFlowRating: Scalars['Int']['output'];
  reportCount: Scalars['Int']['output'];
  reports: Array<Report>;
  slug: Scalars['ID']['output'];
  timeToFlowSeconds: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  titleSlug: Scalars['String']['output'];
  triggers: Array<FlowTrigger>;
};

export type SongLink = {
  __typename?: 'SongLink';
  label: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type SongPage = {
  __typename?: 'SongPage';
  hasNextPage: Scalars['Boolean']['output'];
  songs: Array<Song>;
  totalCount: Scalars['Int']['output'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CatalogFacet: ResolverTypeWrapper<CatalogFacet>;
  CatalogFacets: ResolverTypeWrapper<CatalogFacets>;
  FlowTrigger: ResolverTypeWrapper<FlowTrigger>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Report: ResolverTypeWrapper<CatalogReport>;
  Song: ResolverTypeWrapper<CatalogSong>;
  SongLink: ResolverTypeWrapper<SongLink>;
  SongPage: ResolverTypeWrapper<Omit<SongPage, 'songs'> & { songs: Array<ResolversTypes['Song']> }>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  CatalogFacet: CatalogFacet;
  CatalogFacets: CatalogFacets;
  FlowTrigger: FlowTrigger;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Query: Record<PropertyKey, never>;
  Report: CatalogReport;
  Song: CatalogSong;
  SongLink: SongLink;
  SongPage: Omit<SongPage, 'songs'> & { songs: Array<ResolversParentTypes['Song']> };
  String: Scalars['String']['output'];
};

export type CatalogFacetResolvers<ContextType = any, ParentType extends ResolversParentTypes['CatalogFacet'] = ResolversParentTypes['CatalogFacet']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  songCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type CatalogFacetsResolvers<ContextType = any, ParentType extends ResolversParentTypes['CatalogFacets'] = ResolversParentTypes['CatalogFacets']> = {
  artists?: Resolver<Array<ResolversTypes['CatalogFacet']>, ParentType, ContextType>;
  genres?: Resolver<Array<ResolversTypes['CatalogFacet']>, ParentType, ContextType>;
};

export type FlowTriggerResolvers<ContextType = any, ParentType extends ResolversParentTypes['FlowTrigger'] = ResolversParentTypes['FlowTrigger']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  catalog?: Resolver<ResolversTypes['CatalogFacets'], ParentType, ContextType>;
  report?: Resolver<Maybe<ResolversTypes['Report']>, ParentType, ContextType, RequireFields<QueryReportArgs, 'slug'>>;
  song?: Resolver<Maybe<ResolversTypes['Song']>, ParentType, ContextType, RequireFields<QuerySongArgs, 'slug'>>;
  songs?: Resolver<ResolversTypes['SongPage'], ParentType, ContextType, RequireFields<QuerySongsArgs, 'limit' | 'offset'>>;
};

export type ReportResolvers<ContextType = any, ParentType extends ResolversParentTypes['Report'] = ResolversParentTypes['Report']> = {
  contributor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dateAdded?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  markdown?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  overallFlowRating?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sourceFile?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timeToFlowSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type SongResolvers<ContextType = any, ParentType extends ResolversParentTypes['Song'] = ResolversParentTypes['Song']> = {
  artist?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  artistSlug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bpm?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dateAdded?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  genre?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  genreSlug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  links?: Resolver<Array<ResolversTypes['SongLink']>, ParentType, ContextType>;
  overallFlowRating?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reportCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reports?: Resolver<Array<ResolversTypes['Report']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeToFlowSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  titleSlug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  triggers?: Resolver<Array<ResolversTypes['FlowTrigger']>, ParentType, ContextType>;
};

export type SongLinkResolvers<ContextType = any, ParentType extends ResolversParentTypes['SongLink'] = ResolversParentTypes['SongLink']> = {
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type SongPageResolvers<ContextType = any, ParentType extends ResolversParentTypes['SongPage'] = ResolversParentTypes['SongPage']> = {
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  songs?: Resolver<Array<ResolversTypes['Song']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  CatalogFacet?: CatalogFacetResolvers<ContextType>;
  CatalogFacets?: CatalogFacetsResolvers<ContextType>;
  FlowTrigger?: FlowTriggerResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Report?: ReportResolvers<ContextType>;
  Song?: SongResolvers<ContextType>;
  SongLink?: SongLinkResolvers<ContextType>;
  SongPage?: SongPageResolvers<ContextType>;
};


export type CatalogQueryVariables = Exact<{ [key: string]: never; }>;


export type CatalogQuery = { catalog: { artists: Array<{ name: string, slug: string, songCount: number }>, genres: Array<{ name: string, slug: string, songCount: number }> } };

export type SongsQueryVariables = Exact<{
  search?: string | null | undefined;
  artist?: string | null | undefined;
  genre?: string | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}>;


export type SongsQuery = { songs: { totalCount: number, hasNextPage: boolean, songs: Array<{ id: string, title: string, artist: string, genre: string, overallFlowRating: number, timeToFlowSeconds: number }> } };

export type SongDetailQueryVariables = Exact<{
  slug: string | number;
}>;


export type SongDetailQuery = { song: { id: string, title: string, artist: string, description: string, links: Array<{ label: string, url: string }>, triggers: Array<{ timestamp: string, title: string, description: string }>, reports: Array<{ id: string, contributor: string, overallFlowRating: number, timeToFlowSeconds: number }> } | null };


export const CatalogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Catalog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"artists"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"songCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"genres"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"songCount"}}]}}]}}]}}]} as unknown as DocumentNode<CatalogQuery, CatalogQueryVariables>;
export const SongsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Songs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"artist"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"genre"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"songs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"artist"},"value":{"kind":"Variable","name":{"kind":"Name","value":"artist"}}},{"kind":"Argument","name":{"kind":"Name","value":"genre"},"value":{"kind":"Variable","name":{"kind":"Name","value":"genre"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"songs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"artist"}},{"kind":"Field","name":{"kind":"Name","value":"genre"}},{"kind":"Field","name":{"kind":"Name","value":"overallFlowRating"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFlowSeconds"}}]}}]}}]}}]} as unknown as DocumentNode<SongsQuery, SongsQueryVariables>;
export const SongDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SongDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"song"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"artist"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"links"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"triggers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contributor"}},{"kind":"Field","name":{"kind":"Name","value":"overallFlowRating"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFlowSeconds"}}]}}]}}]}}]} as unknown as DocumentNode<SongDetailQuery, SongDetailQueryVariables>;