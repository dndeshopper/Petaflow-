const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.join(__dirname, "..", "PetalFlow-Dashboard-standalone.html"),
  "utf8"
);

const manifestMatch = html.match(
  /<script type="__bundler\/manifest">\s*([\s\S]*?)\s*<\/script>/
);
if (!manifestMatch) {
  console.error("No manifest found");
  process.exit(1);
}

const manifest = JSON.parse(manifestMatch[1]);
const outDir = path.join(__dirname, "..", "public", "design");
fs.mkdirSync(outDir, { recursive: true });

for (const [uuid, entry] of Object.entries(manifest)) {
  if (!entry.data) continue;
  const binaryStr = Buffer.from(entry.data, "base64");
  let bytes = binaryStr;

  if (entry.compressed) {
    const zlib = require("zlib");
    bytes = zlib.gunzipSync(binaryStr);
  }

  const ext = entry.mime?.includes("png")
    ? "png"
    : entry.mime?.includes("svg")
      ? "svg"
      : entry.mime?.includes("jpeg") || entry.mime?.includes("jpg")
        ? "jpg"
        : "bin";

  const filename = `${uuid}.${ext}`;
  fs.writeFileSync(path.join(outDir, filename), bytes);
  console.log("Wrote", filename, bytes.length, "bytes", entry.mime || "");
}

console.log("Done. Assets in public/design/");
