import { makeOAuthConsent } from "./app";
import { McpAgent } from "agents/mcp";
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import {
  McpOptions,
  initMcpServer,
  server,
  ClientOptions,
} from "scalev-mcp/server";

type MCPProps = {
  clientProps: ClientOptions;
  clientConfig: McpOptions;
};

/**
 * The information displayed on the OAuth consent screen
 */
const serverConfig: ServerConfig = {
  orgName: "Scalev",
  instructionsUrl:
    "https://developers.scalev.id/docs/authentication-with-api-key#/",
  logoUrl:
    "https://cdn.scalev.id/Business/Fy5iqWh2PJQt_CSYqqzoNJf8GZ97gotCnNZjMxpa4qA/1734245697968-scalev_logo_small.webp",
  clientProperties: [
    {
      key: "apiKey",
      label: "Scalev API Key",
      description: "API Key from your Scalev account",
      required: false,
      default: null,
      placeholder: "Enter your Scalev API Key",
      type: "password",
    },
  ],
};

export class MyMCP extends McpAgent<Env, unknown, MCPProps> {
  server = server;

  async init() {
    initMcpServer({
      server: this.server,
      clientOptions: this.props.clientProps,
      mcpOptions: this.props.clientConfig,
    });
  }
}

export type ServerConfig = {
  /**
   * The name of the company/project
   */
  orgName: string;

  /**
   * An optional company logo image
   */
  logoUrl?: string;

  /**
   * An optional URL with instructions for users to get an API key
   */
  instructionsUrl?: string;

  /**
   * Properties collected to initialize the client
   */
  clientProperties: ClientProperty[];
};

export type ClientProperty = {
  key: string;
  label: string;
  description?: string;
  required: boolean;
  default?: unknown;
  placeholder?: string;
  type: "string" | "number" | "password" | "select";
  options?: { label: string; value: string }[];
};

// Export the OAuth handler as the default
export default new OAuthProvider({
  apiHandlers: {
    // @ts-expect-error
    "/sse": MyMCP.serveSSE("/sse"), // legacy SSE
    // @ts-expect-error
    "/mcp": MyMCP.serve("/mcp"), // Streaming HTTP
  },
  defaultHandler: makeOAuthConsent(serverConfig),
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
