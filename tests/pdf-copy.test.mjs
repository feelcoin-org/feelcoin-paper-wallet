import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { jsPDF } from "jspdf";
import { drawCopySafePdfValue } from "../src/pdf-copy.js";

test("PDF copy-ready credentials remain character-for-character exact", () => {
  const wallet = {
    address: "F" + "Q4j9Ab72ZYx3cDe89fGg".repeat(4) + "MC9",
    spendKey: "7f9a23d0b1c4e5f6".repeat(4),
    viewKey: "abcd123456ef7890".repeat(4),
    seed: [
      "sample", "words", "are", "never", "actual", "wallet", "secrets",
      "this", "is", "an", "intentionally", "invalid", "recovery", "phrase",
      "for", "testing", "pdf", "copy", "accuracy", "with", "separators",
      "kept", "between", "each", "word"
    ].join(" ")
  };
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.text("First page: printable wallet", 16, 20);
  doc.addPage("a4", "landscape");

  const rows = [
    ["PUBLIC ADDRESS", wallet.address, 35, "courier"],
    ["PRIVATE SPEND KEY", wallet.spendKey, 73, "courier"],
    ["PRIVATE VIEW KEY", wallet.viewKey, 111, "courier"],
    ["RECOVERY SEED", wallet.seed, 149, "times"]
  ];
  for (const [label, value, top, font] of rows) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, 16, top);
    doc.setFont(font, "normal");
    drawCopySafePdfValue(doc, value, 19, top + 16, 259, 10);
  }

  const dir = mkdtempSync(path.join(tmpdir(), "feelcoin-pdf-copy-"));
  try {
    const pdf = path.join(dir, "test.pdf");
    writeFileSync(pdf, Buffer.from(doc.output("arraybuffer")));

    for (const mode of ["-raw", "-layout"]) {
      const copied = execFileSync(
        "pdftotext", ["-f", "2", "-l", "2", mode, pdf, "-"],
        { encoding: "utf8" }
      );
      for (const [label, value] of rows.map(([label, value]) => [label, value])) {
        assert.ok(copied.includes(value),
          `${label} changed during PDF extraction (${mode})`);
      }
      assert.equal(copied.includes("\uFFFD"), false, "PDF extract contains invalid glyph");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("rejects accidental newlines rather than silently changing credentials", () => {
  const doc = new jsPDF();
  assert.throws(
    () => drawCopySafePdfValue(doc, "Fpart1\npart2", 10, 10, 100, 10),
    /Invalid wallet credential/
  );
});
