import { McpAgent } from "agents/mcp";
import { initMcpServer, server } from "scalev-mcp/server";

export class MyMCP extends McpAgent {
  server = server;

  async init() {
    const token = this.props.bearerToken as string;

    initMcpServer({
      server: this.server,
      clientOptions: {
        defaultHeaders: {
          Authorization: `Bearer ${token}`,
        },
      },
      mcpOptions: {},
    });
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Forbidden", { status: 403 });
    }

    const token = authHeader.split(/\s+/)[1] ?? "";
    ctx.props.bearerToken = token;

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
