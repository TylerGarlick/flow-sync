import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dir, "../..");
const cliPath = join(repositoryRoot, "scripts/src/cli.ts");
const preloadPath = join(repositoryRoot, "scripts/e2e/mock-metadata.ts");
const templatePath = join(repositoryRoot, "docs/TEMPLATE.md");
const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "flowsync-song-generator-"));
  temporaryRoots.push(root);
  await mkdir(join(root, "docs"), { recursive: true });
  await mkdir(join(root, "music"), { recursive: true });
  await writeFile(join(root, "docs/TEMPLATE.md"), await readFile(templatePath));
  await writeFile(join(root, "music/index.md"), "# Music Catalog\n\n## Songs\n\n");
  return root;
}

async function runGenerator(root: string, dryRun = false) {
  const args = [
    "--preload",
    preloadPath,
    cliPath,
    "--url",
    "https://music.apple.com/us/album/test-track/789?i=456",
    "--genre",
    "Electronic",
    "--contributor",
    "@e2e-listener",
    "--flow-rating",
    "5",
    "--time-to-flow-seconds",
    "42",
    "--flow-achieved",
    "yes",
    "--work-context",
    "Coding",
    "--environment",
    "Headphones",
    "--description",
    "A steady rhythm helps maintain focus.",
    "--trigger-points",
    "00:42 – Beat settles",
    ...(dryRun ? ["--dry-run"] : []),
  ];
  const child = Bun.spawn([process.execPath, ...args], {
    cwd: repositoryRoot,
    env: { ...process.env, FLOWSYNC_ROOT: root },
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  child.stdin.write("\n".repeat(10) + (dryRun ? "" : "y\n"));
  child.stdin.end();
  const [stdout, stderr] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  return { exitCode: await child.exited, stdout, stderr };
}

describe("song entry generator CLI", () => {
  test("writes a generated entry and catalog link, then refuses to overwrite it", async () => {
    const root = await createFixture();
    const relativePath = "music/test-artist/electronic/test-track/index.md";
    const entryPath = join(root, relativePath);
    const catalogPath = join(root, "music/index.md");

    const firstRun = await runGenerator(root);
    expect(firstRun.exitCode).toBe(0);
    expect(firstRun.stdout).toContain("Created music/test-artist/electronic/test-track/index.md");
    const generated = await readFile(entryPath, "utf8");
    expect(generated).toContain('artist: "Test Artist"');
    expect(generated).toContain('title: "Test Track"');
    expect(generated).toContain('contributor: "@e2e-listener"');
    expect(generated).toContain("00:42");
    expect(generated).toContain("A steady rhythm helps maintain focus.");

    const catalog = await readFile(catalogPath, "utf8");
    expect(catalog).toContain("* [test-track](test-artist/electronic/test-track/index.md)");

    const secondRun = await runGenerator(root);
    expect(secondRun.exitCode).not.toBe(0);
    expect(secondRun.stderr).toContain("Destination already exists");
    expect(await readFile(entryPath, "utf8")).toBe(generated);
    expect(await readFile(catalogPath, "utf8")).toBe(catalog);
  });

  test("dry-run previews changes without writing either file", async () => {
    const root = await createFixture();
    const result = await runGenerator(root, true);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("--- music/test-artist/electronic/test-track/index.md ---");
    expect(result.stdout).toContain("Dry run: no files were written.");
    await expect(readFile(join(root, "music/test-artist/electronic/test-track/index.md"))).rejects.toThrow();
    expect(await readFile(join(root, "music/index.md"), "utf8")).toBe("# Music Catalog\n\n## Songs\n\n");
  });
});
