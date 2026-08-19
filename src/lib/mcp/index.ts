import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listServicesTool from "./tools/list-services";
import submitContactTool from "./tools/submit-contact";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";

export default defineMcp({
  name: "mubasher-dev-mcp",
  title: "Muhammad Mubasher — Developer",
  version: "0.1.0",
  instructions:
    "Tools for Muhammad Mubasher's web & mobile development portfolio. Use `list_services` to see the development services offered, and `submit_contact` to send a new project inquiry.",
  auth: auth.oauth.issuer({
    issuer: `${supabaseUrl}/auth/v1`,
    jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
    acceptedAudiences: ["authenticated"],
    resourceName: "Muhammad Mubasher — Developer MCP",
  }),
  tools: [listServicesTool, submitContactTool],
});
