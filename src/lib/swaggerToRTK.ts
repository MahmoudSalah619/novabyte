import fs from "fs";
import path from "path";

// Utility functions
export const sanitizeName = (name: string) => name.replace(/-/g, "_");

export const processUrl = (url: string) => {
  const basePath = "/en/api";
  return url.replace(basePath, "").replace(/{([^}]+)}/g, "${$1}");
};

export const extractPathParams = (url: string) => {
  const params: string[] = [];
  const regex = /{([^}]+)}/g;
  let match;
  
  while ((match = regex.exec(url)) !== null) {
    params.push(match[1]);
  }
  return params;
};

export const extractQueryParams = (parameters: any[]) => {
  const queryParams = parameters
    .filter((param) => param.in === "query")
    .map((param) => param.name);
  
  return queryParams.length > 1 ? ["params"] : queryParams;
};

// Endpoint generation
export const generateEndpointCode = (path: string, method: string, operation: any) => {
  const { operationId = "", parameters = [], tags = [] } = operation;
  const processedUrl = processUrl(path);
  const pathParams = extractPathParams(processedUrl);
  const queryParams = extractQueryParams(parameters);
  const tagName = sanitizeName(
    tags[0]?.toLowerCase().replace(/\s+/g, "").replace(/-/g, "_") || "default"
  );
  const isQuery = method.toLowerCase() === "get";
  const isMutation = ["post", "put", "patch", "delete"].includes(
    method.toLowerCase()
  );

  const sanitizedOperationId = sanitizeName(operationId || "unknown_operation");

  const allParams = [...pathParams, ...queryParams];
  const hasBody = parameters.some((param: any) => param.in === "body");

  if (hasBody && isMutation) {
    allParams.push("body");
  }

  const queryParameters =
    allParams.length === 1 &&
    (allParams[0] === "params" || allParams[0] === "body")
      ? allParams[0]
      : `{ ${allParams.join(", ")} }`;

  const detailedComments = isQuery
    ? parameters
        .filter((param: any) => param.in === "query")
        .map((param: any) => {
          const paramType =
            param.type || (param.schema ? param.schema.type : "unknown");
          return `     * ${param.name}: ${paramType}${
            param.description ? ` - ${param.description}` : ""
          }`;
        })
        .join("\n")
    : "";

  const commentBlock = detailedComments
    ? `/*
${detailedComments}
     */`
    : "";

  return `    ${commentBlock}
    ${sanitizedOperationId}: builder.${isQuery ? "query" : "mutation"}({
      query: (${queryParameters}) => ({
        url: \`${processedUrl}\`,
        method: '${method.toUpperCase()}'${
    hasBody && isMutation ? ",\n        body" : ""
  }${isQuery && queryParams.includes("params") ? ",\n        params" : ""}
      }),
      ${isQuery ? "providesTags" : "invalidatesTags"}: ['${tagName}'],
    }),`;
};

// API slice generation
export const generateApiSliceContent = (tagName: string, endpoints: string[]) => {
  const sanitizedTagName = sanitizeName(tagName);
  
  return `import api from './index';

export const ${
    sanitizedTagName.charAt(0).toUpperCase() + sanitizedTagName.slice(1)
  }Api = api.injectEndpoints({
  endpoints: (builder) => ({
${endpoints.join("\n")}
  }),
  overrideExisting: false,
});

export const {
${endpoints
  .map((endpoint) => {
    const withoutComments = endpoint.replace(/\/\*[\s\S]*?\*\//g, '');
    const nameMatch = withoutComments.match(/\s+([a-zA-Z0-9_]+):/);
    if (!nameMatch) return "";
    
    const name = nameMatch[1];
    const isQuery = endpoint.includes("builder.query") || endpoint.includes("providesTags");
    return `  use${name}${isQuery ? "Query" : "Mutation"},`;
  })
  .filter(Boolean)
  .join("\n")}
} = ${sanitizedTagName.charAt(0).toUpperCase() + sanitizedTagName.slice(1)}Api;
`;
};

// Base API generation
export const generateBaseApiContent = (endpointsByTag: Record<string, string[]>) => {
  return `import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      // Add your auth token here if needed
      // const token = (getState() as RootState).auth.token;
      // if (token) {
      //   headers.set("Authorization", \`Bearer \${token}\`);
      // }
      return headers;
    },
  }),
  tagTypes: [${Object.keys(endpointsByTag)
    .map((tag) => `'${sanitizeName(tag.toLowerCase())}'`)
    .join(", ")}],
  endpoints: () => ({}),
});

export default api;
`;
};

// Process Swagger specification
export const processSwaggerSpec = (swagger: any, outputDirectory: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      const endpointsByTag: Record<string, string[]> = {};

      Object.entries(swagger.paths || {}).forEach(([pathKey, methods]: [string, any]) => {
        Object.entries(methods).forEach(([method, operation]: [string, any]) => {
          const tag = operation.tags?.[0];
          if (!tag) {
            console.warn(
              `Skipping endpoint at path "${pathKey}" with method "${method}" because it has no tags.`
            );
            return;
          }

          const sanitizedTag = sanitizeName(tag);
          if (!endpointsByTag[sanitizedTag]) {
            endpointsByTag[sanitizedTag] = [];
          }
          endpointsByTag[sanitizedTag].push(
            generateEndpointCode(pathKey, method, operation)
          );
        });
      });

      // Generate base API configuration
      const baseApiContent = generateBaseApiContent(endpointsByTag);
      const baseApiPath = path.join(outputDirectory, "index.ts");
      fs.writeFileSync(baseApiPath, baseApiContent);
      console.log(`✅ Generated: ${baseApiPath}`);

      // Generate API slice files
      Object.entries(endpointsByTag).forEach(([tag, endpoints]) => {
        if (tag === "default") {
          console.warn(`Skipping generation of file for tag "default".`);
          return;
        }

        const sanitizedTag = sanitizeName(tag);
        const apiSliceContent = generateApiSliceContent(sanitizedTag, endpoints);
        const outputPath = path.join(outputDirectory, `${sanitizedTag}.ts`);
        fs.writeFileSync(outputPath, apiSliceContent);
        console.log(`✅ Generated: ${outputPath}`);
      });

      console.log("\n✨ RTK Query endpoints generation completed successfully!");
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
