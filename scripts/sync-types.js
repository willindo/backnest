#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ---------------------------------------------------------
// 🚫 1. Skip in production (Render, CI, or NODE_ENV=production)
// ---------------------------------------------------------
if (process.env.RENDER || process.env.NODE_ENV === "production") {
  console.log("🛑 Render/production environment detected — skipping sync.");
  process.exit(0);
}

// ---------------------------------------------------------
// 📂 2. Paths setup
// ---------------------------------------------------------
const backendRoot = path.resolve(".");
const backendZodDir = path.join(backendRoot, "src/generated/zod");
const backendDtoDir = path.join(backendRoot, "src"); // we’ll scan dto/ folders recursively
const frontendRoot = path.resolve("../front-commerce");
const frontendZodDir = path.join(frontendRoot, "src/generated/zod");
const frontendDtoDir = path.join(frontendRoot, "src/shared/dto");

// ---------------------------------------------------------
// 🧰 3. Utility functions
// ---------------------------------------------------------
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const item of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, item.name);
    const dest = path.join(destDir, item.name);
    if (item.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

function stripPrismaTypes(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, item.name);
    if (item.isDirectory()) {
      stripPrismaTypes(filePath);
    } else if (filePath.endsWith(".ts")) {
      let content = fs.readFileSync(filePath, "utf-8");
      content = content.replace(/import\s+.*?@prisma\/client.*;\n/g, "");
      content = content.replace(/\bPrisma\.[a-zA-Z0-9_]+\b/g, "any");
      fs.writeFileSync(filePath, content);
    }
  }
}

// ---------------------------------------------------------
// 🔄 4. Sync frontend Prisma client version
// ---------------------------------------------------------
function syncPrismaVersion() {
  const backendPkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
  const backendVersion =
    backendPkg.dependencies?.["@prisma/client"] || backendPkg.devDependencies?.["@prisma/client"];
  if (!backendVersion) return;

  const frontendPkgPath = path.join(frontendRoot, "package.json");
  const frontendPkg = JSON.parse(fs.readFileSync(frontendPkgPath, "utf-8"));
  frontendPkg.devDependencies = frontendPkg.devDependencies || {};
  frontendPkg.devDependencies["@prisma/client"] = backendVersion;

  fs.writeFileSync(frontendPkgPath, JSON.stringify(frontendPkg, null, 2));
  console.log(`🔗 Synced @prisma/client@${backendVersion} to frontend`);

  try {
    execSync("npm install --omit=optional", { cwd: frontendRoot, stdio: "inherit" });
  } catch (err) {
    console.warn("⚠️ Failed to install frontend @prisma/client", err);
  }
}

// ---------------------------------------------------------
// 📦 5. Sync generated Zod schemas
// ---------------------------------------------------------
if (fs.existsSync(backendZodDir)) {
  console.log("📦 Copying backend Zod schemas...");
  copyDir(backendZodDir, frontendZodDir);
  stripPrismaTypes(frontendZodDir);
  console.log("✅ Zod schemas synced");
} else {
  console.warn("⚠️ No backend Zod directory found. Run `npm run prisma:generate` first.");
}

// ---------------------------------------------------------
// 🧩 6. Sync manual DTOs (e.g. checkout.dto.ts)
// ---------------------------------------------------------
function copyDtoFiles(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "dto") {
        const dtoDest = path.join(destDir, srcDir.split("src/")[1]);
        fs.mkdirSync(dtoDest, { recursive: true });
        for (const file of fs.readdirSync(srcPath)) {
          if (file.endsWith(".dto.ts")) {
            const srcFile = path.join(srcPath, file);
            const destFile = path.join(dtoDest, file);
            fs.copyFileSync(srcFile, destFile);
          }
        }
      } else {
        copyDtoFiles(srcPath, destDir);
      }
    }
  }
}

console.log("🧩 Syncing manual DTOs (checkout, auth, etc.)...");
copyDtoFiles(backendDtoDir, frontendDtoDir);
console.log("✅ DTOs synced to frontend");

// ---------------------------------------------------------
// 🧭 7. Sync Prisma client version (optional but nice)
// ---------------------------------------------------------
console.log("🔄 Syncing @prisma/client version...");
syncPrismaVersion();

console.log("\n🎉 All types and DTOs synced successfully!");
