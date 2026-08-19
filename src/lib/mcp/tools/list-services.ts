import { defineTool } from "@lovable.dev/mcp-js";

const services = [
  {
    slug: "frontend-development",
    name: "Frontend Development",
    description: "Pixel-accurate, responsive, accessible interfaces with React, Next.js and Tailwind.",
  },
  {
    slug: "web-app-development",
    name: "Web App Development",
    description: "Full-stack products — dashboards, portals and SaaS with auth, payments and realtime.",
  },
  {
    slug: "mobile-app-development",
    name: "Mobile App Development",
    description: "Cross-platform iOS and Android apps built with React Native or Flutter.",
  },
  {
    slug: "backend-apis",
    name: "Backend & APIs",
    description: "Node services, REST/GraphQL APIs, PostgreSQL schemas and secure auth flows.",
  },
  {
    slug: "devops-deployment",
    name: "DevOps & Deployment",
    description: "Docker, CI/CD pipelines, AWS/Vercel deploys, monitoring and zero-downtime releases.",
  },
  {
    slug: "performance-maintenance",
    name: "Performance & Maintenance",
    description: "Core Web Vitals tuning, bundle optimisation, bug fixing and ongoing support.",
  },
];

export default defineTool({
  name: "list_services",
  title: "List development services",
  description: "Returns the web and mobile app development services offered, with a short description of each.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(services, null, 2) }],
    structuredContent: { services },
  }),
});
