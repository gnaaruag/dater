import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";

const root = resolve("out");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".woff2": "font/woff2", ".ico": "image/x-icon" };
createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const file = resolve(root, `.${decodeURIComponent(pathname === "/" ? "/index.html" : pathname)}`);
  if (!file.startsWith(`${root}/`)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(Number(process.env.PORT || 3000), () => console.log("dater: http://localhost:" + (process.env.PORT || 3000)));
