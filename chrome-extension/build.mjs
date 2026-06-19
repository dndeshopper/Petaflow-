import { mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import * as esbuild from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "dist");
const iconsDir = join(__dirname, "icons");

mkdirSync(distDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });

/** Minimal 1×1 PNG (valid placeholder; Chrome scales for toolbar/notifications). */
const MINI_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

for (const size of [16, 48, 128]) {
  const iconPath = join(iconsDir, `icon${size}.png`);
  if (!existsSync(iconPath)) {
    writeFileSync(iconPath, MINI_PNG);
  }
}

const shared = {
  bundle: true,
  platform: "browser",
  target: "chrome120",
  format: "esm",
  sourcemap: true,
  logLevel: "info",
};

await esbuild.build({
  ...shared,
  entryPoints: [join(__dirname, "src/background.ts")],
  outfile: join(distDir, "background.js"),
});

await esbuild.build({
  ...shared,
  entryPoints: [join(__dirname, "src/content.ts")],
  outfile: join(distDir, "content.js"),
});

console.log("PetalFlow extension built → chrome-extension/dist/");
