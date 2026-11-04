import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const packageRoot = fileURLToPath(new URL("../../../", import.meta.url));

function findJavaScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return findJavaScriptFiles(filename);
    return entry.name.endsWith(".js") ? [filename] : [];
  });
}

describe("Native Node ESM server exports", () => {
  it.each([
    ["payload-auth", "payloadAdapter", "betterAuthPlugin"],
    ["payload-auth/better-auth", "payloadAdapter", "betterAuthPlugin"],
    ["payload-auth/better-auth/adapter", "payloadAdapter", "generateSchema"],
    ["payload-auth/better-auth/plugin", "betterAuthPlugin", "getPayloadAuth"]
  ])("loads %s without a bundler", (specifier, ...exports) => {
    const result = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `import { strict as assert } from "node:assert";
         const module = await import(${JSON.stringify(specifier)});
         for (const name of ${JSON.stringify(exports)}) {
           assert.equal(typeof module[name], "function", name);
         }`
      ],
      {
        cwd: packageRoot,
        encoding: "utf8",
        env: { ...process.env, NODE_OPTIONS: "" },
        timeout: 30_000
      }
    );

    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  });

  it("emits resolvable relative imports and preserves copied style assets", () => {
    const files = findJavaScriptFiles(path.join(packageRoot, "dist"));
    expect(files.length).toBeGreaterThan(0);
    let styleImports = 0;

    for (const filename of files) {
      const source = ts.createSourceFile(
        filename,
        readFileSync(filename, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.JS
      );

      function visit(node: ts.Node) {
        let specifier: ts.Expression | undefined;
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
          specifier = node.moduleSpecifier;
        } else if (
          ts.isCallExpression(node) &&
          node.expression.kind === ts.SyntaxKind.ImportKeyword
        ) {
          specifier = node.arguments[0];
        }

        if (specifier && ts.isStringLiteralLike(specifier)) {
          const value = specifier.text;
          expect(value, filename).not.toMatch(/^@\//);
          if (value.startsWith("./") || value.startsWith("../")) {
            const target = path.resolve(path.dirname(filename), value);
            expect(statSync(target).isFile(), `${filename}: ${value}`).toBe(true);
            if (/\.(css|scss)$/.test(value)) styleImports += 1;
            else expect(value, filename).toMatch(/\.(js|mjs|cjs|json)$/);
          }
        }
        ts.forEachChild(node, visit);
      }

      visit(source);
    }
    expect(styleImports).toBeGreaterThan(0);
  });

  it("builds every declared package export", () => {
    const manifest = JSON.parse(
      readFileSync(path.join(packageRoot, "package.json"), "utf8")
    );
    for (const conditions of Object.values(manifest.exports)) {
      for (const target of Object.values(conditions as Record<string, string>)) {
        expect(statSync(path.join(packageRoot, target)).isFile(), target).toBe(true);
      }
    }
  });
});
