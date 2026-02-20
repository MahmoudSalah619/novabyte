const fs = require("fs");
const path = require("path");

// Static paths configuration
const SWAGGER_PATH = path.join(__dirname, "swagger.json");
const OUTPUT_DIRECTORY = path.join(__dirname, "output");

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

  // Generate detailed comments for GET requests only
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
  return `import {
  createApi,
  fetchBaseQuery,
  retry,
  BaseQueryApi,
  FetchBaseQueryError,
  FetchArgs,
} from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DomainUrl from "@/apis/Domain";
import { login, logout } from "@/redux/authReducer";
import { RootState } from "@/redux";
import { AuthTokenResponse } from "./@types/auth";

const rawBaseQuery = (baseUrl: string) =>
  fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const { token } = (getState() as RootState).auth;
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", \`Token \${token}\`);
      }
      return headers;
    },
  });

const baseQuery = async (
  args: FetchArgs,
  api: BaseQueryApi,
  extraOptions: object
) => {
  const lang = await AsyncStorage.getItem("lang");
  const languageText = lang?.includes("ar") ? "ar" : "en";

  const baseUrl = \`\${DomainUrl}/\${languageText}/api\`;

  return rawBaseQuery(baseUrl)(args, api, extraOptions);
};

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 0 });

const baseQueryWithReauth = async (
  args: FetchArgs,
  api: BaseQueryApi,
  extraOptions: object
) => {
  let result = await baseQueryWithRetry(args, api, extraOptions);

  const getNewAccessToken = async () => {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    const refreshResult = (await baseQueryWithRetry(
      {
        url: "/token/refresh/",
        method: "post",
        body: { refresh: refreshToken },
      },
      api,
      extraOptions
    )) as { data: AuthTokenResponse };

    return refreshResult;
  };

  const saveTheNewAccessTokenAndRetrySameRequest = async (
    newAccessToken: string
  ) => {
    AsyncStorage.setItem("token", newAccessToken);
    api.dispatch(login(newAccessToken));
    result = (await baseQueryWithRetry(args, api, extraOptions)) as {
      error: FetchBaseQueryError;
    };
  };

  const isTokenExpire = result?.error?.data?.code?.includes("token_not_valid");

  if (isTokenExpire) {
    const refreshResult = await getNewAccessToken();

    if (refreshResult.data?.access) {
      await saveTheNewAccessTokenAndRetrySameRequest(
        refreshResult.data?.access
      );
    } else {
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("refreshToken");
      api.dispatch(logout());
    }
  }

  return result;
};

const api = createApi({
  reducerPath: "splitApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [${Object.keys(endpointsByTag)
    .map((tag) => `'${sanitizeName(tag.toLowerCase())}'`)
    .join(", ")}],
  endpoints: () => ({}),
});

export default api;
`;
};

// Main process
const processSwaggerSpec = () => {
  try {
    if (!fs.existsSync(SWAGGER_PATH)) {
      throw new Error(`Swagger specification not found at ${SWAGGER_PATH}`);
    }

    const swagger = JSON.parse(fs.readFileSync(SWAGGER_PATH, "utf8"));
    
    if (!fs.existsSync(OUTPUT_DIRECTORY)) {
      fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
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
    const baseApiPath = path.join(OUTPUT_DIRECTORY, "index.ts");
    fs.writeFileSync(baseApiPath, baseApiContent);
    console.log(`Generated: ${baseApiPath}`);

    // Generate API slice files
    Object.entries(endpointsByTag).forEach(([tag, endpoints]) => {
      if (tag === "default") {
        console.warn(`Skipping generation of file for tag "default".`);
        return;
      }

      const sanitizedTag = sanitizeName(tag);
      const apiSliceContent = generateApiSliceContent(sanitizedTag, endpoints);
      const outputPath = path.join(OUTPUT_DIRECTORY, `${sanitizedTag}.ts`);
      fs.writeFileSync(outputPath, apiSliceContent);
      console.log(`Generated: ${outputPath}`);
    });

    console.log("\nRTK Query endpoints generation completed successfully!");
  } catch (error) {
    console.error("Error processing Swagger specification:", error.message);
    process.exit(1);
  }
};

// Run the script
processSwaggerSpec();
