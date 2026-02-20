const fs = require("fs");
const path = require("path");

// Utility functions
const sanitizeName = (name) => name.replace(/-/g, "_");

const processUrl = (url) => {
  const basePath = "/en/api";
  return url.replace(basePath, "").replace(/{([^}]+)}/g, "${$1}");
};

const extractPathParams = (url) => {
  const params = [];
  const regex = /{([^}]+)}/g;
  let match;
  
  while ((match = regex.exec(url)) !== null) {
    params.push(match[1]);
  }
  return params;
};

const extractQueryParams = (parameters) => {
  const queryParams = parameters
    .filter((param) => param.in === "query")
    .map((param) => param.name);
  
  return queryParams.length > 1 ? ["params"] : queryParams;
};

// Endpoint generation
const generateEndpointCode = (path, method, operation) => {
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
  const hasBody = parameters.some((param) => param.in === "body");

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
        .filter((param) => param.in === "query")
        .map((param) => {
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
const generateApiSliceContent = (tagName, endpoints) => {
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
const generateBaseApiContent = (endpointsByTag) => {
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
const processSwaggerSpec = (swaggerPath, outputDirectory) => {
  return new Promise((resolve, reject) => {
    try {
      const swagger = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
      
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      const endpointsByTag = {};

      Object.entries(swagger.paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, operation]) => {
          const tag = operation.tags?.[0];
          if (!tag) {
            console.warn(
              `Skipping endpoint at path "${path}" with method "${method}" because it has no tags.`
            );
            return;
          }

          const sanitizedTag = sanitizeName(tag);
          if (!endpointsByTag[sanitizedTag]) {
            endpointsByTag[sanitizedTag] = [];
          }
          endpointsByTag[sanitizedTag].push(
            generateEndpointCode(path, method, operation)
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

module.exports = {
  processSwaggerSpec,
  sanitizeName,
  processUrl,
  extractPathParams,
  extractQueryParams,
  generateEndpointCode,
  generateApiSliceContent,
  generateBaseApiContent
};
