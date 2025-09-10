import { McpAgent } from "agents/mcp";
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

// Main worker handler without OAuth
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Forbidden", { status: 403 });
    }

    const apiKey = authHeader.split(/\s+/)[1] ?? "";

    ctx.props.clientProps = {
      ...ctx.props.clientProps,
      apiKey,
    };

    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      // @ts-ignore
      return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    if (url.pathname === "/mcp") {
      // @ts-ignore
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
