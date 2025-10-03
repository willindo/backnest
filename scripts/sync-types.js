#!/usr/bin/env node
import fs from "fs";
import path from "path";

const backendZodDir = path.resolve("src/generated/zod");
const frontendZodDir = path.resolve("../front-commerce/src/generated/zod");

// Recursively copy directory
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const item of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, item.name);
    const dest = path.join(destDir, item.name);

    if (item.isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

// Run sync
if (fs.existsSync(backendZodDir)) {
  copyDir(backendZodDir, frontendZodDir);
  console.log("✅ Synced Zod types to frontend");
} else {
  console.error("❌ No backend Zod directory found. Run `npm run prisma:generate` first.");
}
