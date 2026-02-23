import { db } from "./connection.js";
import { seedSkillTree, updateTemplatesForSkillTree } from "./seed-logic.js";
import { existsSync, readdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import { loadYamlSkillTree } from "../content/loader.js";
import type { SkillTreeDef } from "../seed/types.js";

async function seed() {
  console.log("Seeding database...");

  // Load skill trees from the content directory
  // Accept --skilltree <name> CLI arg, or default to all skill trees
  const args = process.argv.slice(2);
  const skilltreeArgIndex = args.indexOf("--skilltree");
  const requestedSkillTree = skilltreeArgIndex >= 0 ? args[skilltreeArgIndex + 1] : null;
  const updateTemplatesOnly = args.includes("--update-templates");

  // Discover available skill trees
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const contentDir = join(__dirname, "..", "content");

  let skilltreeDirs: string[];
  try {
    skilltreeDirs = readdirSync(contentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    console.error(`No content directory found at ${contentDir}`);
    process.exit(1);
  }

  if (requestedSkillTree) {
    if (!skilltreeDirs.includes(requestedSkillTree)) {
      console.error(`Skill tree "${requestedSkillTree}" not found. Available: ${skilltreeDirs.join(", ")}`);
      process.exit(1);
    }
    skilltreeDirs = [requestedSkillTree];
  }

  for (const skilltreeDir of skilltreeDirs) {
    const fullSkilltreeDir = join(contentDir, skilltreeDir);
    let skilltree: SkillTreeDef;

    if (existsSync(join(fullSkilltreeDir, "skilltree.yaml"))) {
      skilltree = loadYamlSkillTree(fullSkilltreeDir);
    } else {
      const skilltreePath = pathToFileURL(join(fullSkilltreeDir, "index.ts")).href;
      const skilltreeModule = await import(skilltreePath);
      skilltree = skilltreeModule.default;
    }

    if (updateTemplatesOnly) {
      await updateTemplatesForSkillTree(db, skilltree);
    } else {
      await seedSkillTree(db, skilltree);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
