import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// @ts-expect-error The report script is an executable ESM utility without a declaration file.
import { generateCardArtQualityReport } from "../../scripts/card-art-quality-report.mjs";

const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

describe("card art quality report", () => {
  it("generates repeatable quality data and a ranked replacement queue", async () => {
    const reportsDir = await mkdtemp(join(tmpdir(), "inkblade-card-art-report-"));
    const reportJsonPath = join(reportsDir, "card-art-quality-report.json");
    const reportMarkdownPath = join(reportsDir, "card-art-quality-report.md");

    generateCardArtQualityReport({
      projectRoot,
      jsonPath: reportJsonPath,
      markdownPath: reportMarkdownPath
    });

    try {
      expect(existsSync(reportJsonPath)).toBe(true);
      expect(existsSync(reportMarkdownPath)).toBe(true);

      const report = JSON.parse(readFileSync(reportJsonPath, "utf8"));
      const markdown = readFileSync(reportMarkdownPath, "utf8");

      expect(report.summary.cardCount).toBe(150);
      expect(report.summary.runtimeAssetAudit.runtimeReferenceCount).toBeGreaterThan(0);
      expect(report.summary.runtimeAssetAudit.uniqueRuntimeFileCount).toBeGreaterThan(0);
      expect(report.formatDistribution.png + report.formatDistribution.svg).toBe(150);
      expect(report.duplicateReuse.groups.length).toBeGreaterThan(0);
      expect(report.duplicateReuse.groups[0].reuseCount).toBeGreaterThan(1);
      expect(report.replacementQueue.length).toBeGreaterThan(0);
      expect(report.replacementQueue[0]).toEqual(
        expect.objectContaining({
          rank: 1,
          cardId: expect.any(String),
          assetPath: expect.stringMatching(/^\/assets\/generated\/cards\/.+\.(png|svg)$/),
          score: expect.any(Number),
          reasons: expect.any(Array)
        })
      );
      expect(markdown).toContain("## Runtime Totals");
      expect(markdown).toContain("## Duplicate Asset Reuse");
      expect(markdown).toContain("## Ranked Replacement Queue");
    } finally {
      await rm(reportsDir, { recursive: true, force: true });
    }
  });
});
