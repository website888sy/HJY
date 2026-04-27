import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const scanDirs = ["about", "data", "home", "object", "photo", "root"];

const manifest = {
  generatedAt: new Date().toISOString(),
  files: [],
};

for (const dir of scanDirs) {
  const absoluteDir = path.join(projectRoot, dir);
  const exists = await pathExists(absoluteDir);
  if (!exists) {
    continue;
  }
  const files = await walkDirectory(absoluteDir);
  files.forEach((filePath) => {
    const relative = toPosix(path.relative(projectRoot, filePath));
    const name = path.basename(filePath);
    manifest.files.push({
      path: relative,
      dir,
      name,
      baseName: path.basename(filePath, path.extname(filePath)),
      extension: path.extname(filePath).toLowerCase(),
    });
  });
}

manifest.files.sort((a, b) => a.path.localeCompare(b.path));

const outputPath = path.join(projectRoot, "root", "site-manifest.json");
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Manifest written to ${outputPath}`);

async function walkDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDirectory(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}
