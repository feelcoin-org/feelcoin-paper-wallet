/**
 * Write a whole wallet credential as a single PDF text operation.
 *
 * PDF text extractors can insert spaces/newlines when a credential is
 * broken into independently positioned lines. Do not mutate the data:
 * mnemonic words intentionally retain their original separators.
 */
export function drawCopySafePdfValue(doc, value, x, y, maxWidth, fontSize) {
  if (
    typeof value !== "string" ||
    !value ||
    /[\r\n]/.test(value)
  ) {
    throw new Error("Invalid wallet credential format for PDF export");
  }

  doc.setFontSize(fontSize);
  const measuredWidth = doc.getTextWidth(value);
  if (!Number.isFinite(measuredWidth) || measuredWidth <= 0) {
    throw new Error("Unable to measure wallet PDF text");
  }

  // Shrink only the presentation size, not the credential content.
  const fittedSize = measuredWidth > maxWidth
    ? fontSize * maxWidth / measuredWidth * 0.98
    : fontSize;

  doc.setFontSize(fittedSize);
  doc.text(value, x, y, { charSpace: 0 });
}
