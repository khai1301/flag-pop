import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
async function files(dir) {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const name = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...(await files(name)));
    else result.push(name);
  }
  return result;
}
const paths = (await files("dist")).filter((f) => !['sw.js', '_headers', '_redirects'].includes(path.basename(f)));
const hash = createHash("sha256");
for (const f of paths) hash.update(await readFile(f));
const version = "flagpop-" + hash.digest("hex").slice(0, 12);
const assets = paths.map(
  (f) => "/" + path.relative("dist", f).replaceAll("\\", "/"),
);
await writeFile(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(version)};const ASSETS=${JSON.stringify(["/", ...assets])};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('flagpop-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;if(event.request.mode==='navigate'){event.respondWith(caches.open(CACHE).then(cache=>cache.match('/index.html')).then(cached=>cached||fetch(event.request)));return;}event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(cached=>cached||fetch(event.request)));});
`,
);
console.log(`Offline cache: ${assets.length} assets, ${version}`);
