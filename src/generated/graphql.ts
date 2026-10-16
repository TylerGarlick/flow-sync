import type { GraphQLResolveInfo } from 'graphql';
import type { CatalogSong, CatalogReport } from '../catalog.js';
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

export type MetadataCandidate = {
  __typename?: 'MetadataCandidate';
  artist: Scalars['String']['output'];
  links: Array<SongLink>;
  source: MetadataSource;
  title: Scalars['String']['output'];
};

export type MetadataLookupInput = {
  artist?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type MetadataLookupResult = {
  __typename?: 'MetadataLookupResult';
  candidates: Array<MetadataCandidate>;
  warnings: Array<Scalars['String']['output']>;
};

export type MetadataSource =
  | 'APPLE_MUSIC'
  | 'MANUAL'
  | 'MUSICBRAINZ';

export type Mutation = {
  __typename?: 'Mutation';
  generateSongEntry: SongEntryGenerationResult;
};


export type MutationGenerateSongEntryArgs = {
  confirm: Scalars['Boolean']['input'];
  input: SongEntryInput;
};

export type Query = {
  __typename?: 'Query';
  catalog: CatalogFacets;
  metadataLookup: MetadataLookupResult;
  report?: Maybe<Report>;
  song?: Maybe<Song>;
  songEntryPreview: SongEntryPreview;
  songs: SongPage;
};


export type QueryMetadataLookupArgs = {
  input: MetadataLookupInput;
};


export type QueryReportArgs = {
  slug: Scalars['ID']['input'];
};


export type QuerySongArgs = {
  slug: Scalars['ID']['input'];
};


export type QuerySongEntryPreviewArgs = {
  input: SongEntryInput;
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

export type SongEntryDetailsInput = {
  contributor: Scalars['String']['input'];
  dateAdded?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  environment: Scalars['String']['input'];
  flowAchieved: Scalars['Boolean']['input'];
  flowRating: Scalars['Int']['input'];
  genre: Scalars['String']['input'];
  genreSlug?: InputMaybe<Scalars['String']['input']>;
  timeToFlowSeconds: Scalars['Int']['input'];
  triggerPoints: Array<Scalars['String']['input']>;
  workContext: Scalars['String']['input'];
};

export type SongEntryGenerationResult = {
  __typename?: 'SongEntryGenerationResult';
  catalogUpdated: Scalars['Boolean']['output'];
  created: Scalars['Boolean']['output'];
  path: Scalars['String']['output'];
};

export type SongEntryInput = {
  details: SongEntryDetailsInput;
  metadata: SongMetadataInput;
};

export type SongEntryPreview = {
  __typename?: 'SongEntryPreview';
  alreadyExists: Scalars['Boolean']['output'];
  catalogChanged: Scalars['Boolean']['output'];
  catalogMarkdown: Scalars['String']['output'];
  markdown: Scalars['String']['output'];
  path: Scalars['String']['output'];
};

export type SongLink = {
  __typename?: 'SongLink';
  label: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type SongLinkInput = {
  label: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type SongMetadataInput = {
  artist: Scalars['String']['input'];
  links: Array<SongLinkInput>;
  source: MetadataSource;
  title: Scalars['String']['input'];
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
  MetadataCandidate: ResolverTypeWrapper<MetadataCandidate>;
  MetadataLookupInput: MetadataLookupInput;
  MetadataLookupResult: ResolverTypeWrapper<MetadataLookupResult>;
  MetadataSource: MetadataSource;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Report: ResolverTypeWrapper<CatalogReport>;
  Song: ResolverTypeWrapper<CatalogSong>;
  SongEntryDetailsInput: SongEntryDetailsInput;
  SongEntryGenerationResult: ResolverTypeWrapper<SongEntryGenerationResult>;
  SongEntryInput: SongEntryInput;
  SongEntryPreview: ResolverTypeWrapper<SongEntryPreview>;
  SongLink: ResolverTypeWrapper<SongLink>;
  SongLinkInput: SongLinkInput;
  SongMetadataInput: SongMetadataInput;
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
  MetadataCandidate: MetadataCandidate;
  MetadataLookupInput: MetadataLookupInput;
  MetadataLookupResult: MetadataLookupResult;
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  Report: CatalogReport;
  Song: CatalogSong;
  SongEntryDetailsInput: SongEntryDetailsInput;
  SongEntryGenerationResult: SongEntryGenerationResult;
  SongEntryInput: SongEntryInput;
  SongEntryPreview: SongEntryPreview;
  SongLink: SongLink;
  SongLinkInput: SongLinkInput;
  SongMetadataInput: SongMetadataInput;
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

export type MetadataCandidateResolvers<ContextType = any, ParentType extends ResolversParentTypes['MetadataCandidate'] = ResolversParentTypes['MetadataCandidate']> = {
  artist?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  links?: Resolver<Array<ResolversTypes['SongLink']>, ParentType, ContextType>;
  source?: Resolver<ResolversTypes['MetadataSource'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type MetadataLookupResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['MetadataLookupResult'] = ResolversParentTypes['MetadataLookupResult']> = {
  candidates?: Resolver<Array<ResolversTypes['MetadataCandidate']>, ParentType, ContextType>;
  warnings?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  generateSongEntry?: Resolver<ResolversTypes['SongEntryGenerationResult'], ParentType, ContextType, RequireFields<MutationGenerateSongEntryArgs, 'confirm' | 'input'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  catalog?: Resolver<ResolversTypes['CatalogFacets'], ParentType, ContextType>;
  metadataLookup?: Resolver<ResolversTypes['MetadataLookupResult'], ParentType, ContextType, RequireFields<QueryMetadataLookupArgs, 'input'>>;
  report?: Resolver<Maybe<ResolversTypes['Report']>, ParentType, ContextType, RequireFields<QueryReportArgs, 'slug'>>;
  song?: Resolver<Maybe<ResolversTypes['Song']>, ParentType, ContextType, RequireFields<QuerySongArgs, 'slug'>>;
  songEntryPreview?: Resolver<ResolversTypes['SongEntryPreview'], ParentType, ContextType, RequireFields<QuerySongEntryPreviewArgs, 'input'>>;
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

export type SongEntryGenerationResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SongEntryGenerationResult'] = ResolversParentTypes['SongEntryGenerationResult']> = {
  catalogUpdated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  path?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type SongEntryPreviewResolvers<ContextType = any, ParentType extends ResolversParentTypes['SongEntryPreview'] = ResolversParentTypes['SongEntryPreview']> = {
  alreadyExists?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  catalogChanged?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  catalogMarkdown?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  markdown?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  path?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  MetadataCandidate?: MetadataCandidateResolvers<ContextType>;
  MetadataLookupResult?: MetadataLookupResultResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Report?: ReportResolvers<ContextType>;
  Song?: SongResolvers<ContextType>;
  SongEntryGenerationResult?: SongEntryGenerationResultResolvers<ContextType>;
  SongEntryPreview?: SongEntryPreviewResolvers<ContextType>;
  SongLink?: SongLinkResolvers<ContextType>;
  SongPage?: SongPageResolvers<ContextType>;
};

