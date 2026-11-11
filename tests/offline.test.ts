import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

test(
  "production cache manifest contains all flags and only real local files",
  { skip: !existsSync("dist/sw.js") },
  async () => {
    const handlers: Record<string, Function> = {};
    let assets: string[] = [];
    let pending: Promise<unknown>;
    let claimed = false;
    const deleted: string[] = [];
    const context = {
      self: {
        addEventListener: (name: string, handler: Function) =>
          (handlers[name] = handler),
        location: { origin: "https://flagpop.test" },
        clients: {
          claim: async () => {
            claimed = true;
          },
        },
      },
      caches: {
        open: async () => ({
          addAll: async (items: string[]) => {
            assets = items;
          },
          match: async (request: string) =>
            request === "/" || request === "/index.html"
              ? {
                  redirected: false,
                  blob: async () => new Blob(["cached shell"]),
                  status: 200,
                  statusText: "OK",
                  headers: new Headers(),
                }
              : undefined,
        }),
        keys: async () => ["another-app-cache", "flagpop-old"],
        delete: async (name: string) => {
          deleted.push(name);
        },
      },
      fetch: async () => {
        throw new Error("offline");
      },
      URL,
    };
    vm.runInNewContext(readFileSync("dist/sw.js", "utf8"), context);
    handlers.install({
      waitUntil: (p: Promise<unknown>) => {
        pending = p;
      },
    });
    await pending!;
    assert.equal(assets.filter((a) => a.startsWith("/flags/")).length, 195);
    for (const asset of assets) {
      assert.ok(!asset.startsWith("http"));
      if (asset !== "/") assert.ok(existsSync("dist" + asset), asset);
    }
    handlers.activate({
      waitUntil: (p: Promise<unknown>) => {
        pending = p;
      },
    });
    await pending!;
    assert.ok(claimed);
    assert.deepEqual(deleted, ["flagpop-old"]);
    let response: Promise<unknown>;
    handlers.fetch({
      request: {
        url: "https://flagpop.test/",
        method: "GET",
        mode: "navigate",
      },
      respondWith: (r: Promise<unknown>) => {
        response = r;
      },
    });
    assert.equal((await response! as any).status, 200);
  },
);
