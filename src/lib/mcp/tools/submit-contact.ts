import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export default defineTool({
  name: "submit_contact",
  title: "Submit a contact request",
  description:
    "Send a new contact request to the agency (same as the public contact form on the site). Provide the sender's name, email, and message.",
  inputSchema: {
    name: z.string().trim().min(2).max(80).describe("Full name of the person reaching out."),
    email: z.string().trim().email().max(200).describe("Reply-to email address."),
    message: z
      .string()
      .trim()
      .min(10)
      .max(1500)
      .describe("What they want help with. Include goals, timeline, and any context."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, email, message }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      return { content: [{ type: "text", text: "Server not configured." }], isError: true };
    }

    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { error } = await supabase
      .from("contact_submissions")
      .insert({ name, email, message, user_agent: "mcp" });

    if (error) {
      console.error("[mcp:submit_contact] insert failed", error);
      return {
        content: [{ type: "text", text: "Could not save your request. Please try again." }],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: "Contact request received. The team will be in touch." }],
      structuredContent: { ok: true },
    };
  },
});
