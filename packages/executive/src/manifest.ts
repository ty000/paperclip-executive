import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const manifest: PaperclipPluginManifestV1 = {
  id: "paperclip-executive.executive",
  apiVersion: 1,
  version: "0.3.0",
  displayName: "Paperclip Executive",
  description: "Attributable executive advice through native Paperclip agent sessions.",
  author: "Davy Guittard",
  categories: ["automation", "ui"],
  capabilities: [
    "agents.read",
    "issues.read",
    "agents.managed",
    "access.members.read",
    "agent.sessions.create",
    "agent.sessions.send",
    "events.subscribe",
    "events.emit",
    "database.namespace.migrate",
    "database.namespace.read",
    "database.namespace.write",
    "ui.page.register",
  ],
  entrypoints: { worker: "./dist/worker.js", ui: "./dist/ui" },
  database: { namespaceSlug: "executive", migrationsDir: "migrations" },
  agents: [
    {
      agentKey: "executive",
      displayName: "Executive",
      role: "general",
      title: "Executive Advisor",
      capabilities: "Provides bounded, attributable advice without authorizing or creating work.",
      status: "paused",
      instructions: { entryFile: "AGENTS.md", assetPath: "profiles/executive" },
    },
  ],
  ui: {
    slots: [
      {
        type: "page",
        id: "advice",
        routePath: "executive",
        displayName: "Executive",
        exportName: "ExecutivePage",
      },
    ],
  },
};

export default manifest;
