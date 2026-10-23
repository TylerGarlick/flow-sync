import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "schema.graphql",
  documents: "graphql/operations.graphql",
  generates: {
    "src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-resolvers",
      ],
      config: {
        enumsAsTypes: true,
        useTypeImports: true,
        mappers: {
          Song: "../catalog.js#CatalogSong",
          Report: "../catalog.js#CatalogReport",
        },
      },
    },
    "src/generated/operations.ts": {
      plugins: [
        "typescript-operations",
        "typed-document-node",
      ],
      config: {
        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
