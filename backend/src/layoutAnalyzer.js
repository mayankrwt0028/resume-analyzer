
export function analyzeLayout(pages) {
  const reports = [];

  for (const page of pages) {
    const { width, height, items, pageNumber } = page;

    const textItems = items.filter(
      (item) => item.text.trim() && item.height > 0
    );

    if (textItems.length === 0) continue;

 
    const leftEdges = textItems.map((item) => item.x);

    const rightEdges = textItems.map(
      (item) => item.x + item.width
    );

    const topEdges = textItems.map(
      (item) => item.y + item.height
    );

    const bottomEdges = textItems.map((item) => item.y);

    const leftMargin = Math.min(...leftEdges);
    const rightMargin = width - Math.max(...rightEdges);
    const topMargin = height - Math.max(...topEdges);
    const bottomMargin = Math.min(...bottomEdges);


    const fontSizes = textItems.map((item) => item.height);

    const averageFontSize =
      fontSizes.reduce((sum, size) => sum + size, 0) /
      fontSizes.length;

    const fontVariation =
      Math.max(...fontSizes) - Math.min(...fontSizes);

    // 3. Group text items into approximate lines
    const sortedItems = [...textItems].sort(
      (a, b) => Math.abs(b.y - a.y) < 2
        ? a.x - b.x
        : b.y - a.y
    );

    const lines = [];

    for (const item of sortedItems) {
      let line = lines.find(
        (existing) => Math.abs(existing.y - item.y) < 2
      );

      if (!line) {
        line = {
          y: item.y,
          items: []
        };

        lines.push(line);
      }

      line.items.push(item);
    }

    // 4. Calculate approximate vertical spacing
    lines.sort((a, b) => b.y - a.y);

    const gaps = [];

    for (let i = 0; i < lines.length - 1; i++) {
      const gap = lines[i].y - lines[i + 1].y;

      if (gap > 0 && gap < 100) {
        gaps.push(gap);
      }
    }

    const averageSpacing = gaps.length
      ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
      : 0;

    // 5. Check approximate left alignment
    const lineStarts = lines.map((line) =>
      Math.min(...line.items.map((item) => item.x))
    );

    const commonLeftPosition = lineStarts.length
      ? lineStarts.reduce((sum, x) => sum + x, 0) /
        lineStarts.length
      : 0;

    const alignedLines = lineStarts.filter(
      (x) => Math.abs(x - commonLeftPosition) < 5
    ).length;

    const alignmentPercentage = lineStarts.length
      ? Math.round((alignedLines / lineStarts.length) * 100)
      : 0;

    // 6. Basic margin warnings
    const warnings = [];

    if (leftMargin < 25 || rightMargin < 25) {
      warnings.push("Content is close to the horizontal page edges.");
    }

    if (topMargin < 20 || bottomMargin < 20) {
      warnings.push("Content is close to the vertical page edges.");
    }

    if (fontVariation > 10) {
      warnings.push(
        "Large font-size variation detected. Review font hierarchy."
      );
    }

    reports.push({
      pageNumber,
      pageWidth: Number(width.toFixed(2)),
      pageHeight: Number(height.toFixed(2)),
      margins: {
        left: Number(leftMargin.toFixed(2)),
        right: Number(rightMargin.toFixed(2)),
        top: Number(topMargin.toFixed(2)),
        bottom: Number(bottomMargin.toFixed(2))
      },
      averageTextHeight: Number(averageFontSize.toFixed(2)),
      fontVariation: Number(fontVariation.toFixed(2)),
      alignmentPercentage,
      averageLineSpacing: Number(averageSpacing.toFixed(2)),
      totalTextItems: textItems.length,
      totalLines: lines.length,
      warnings
    });
  }

  return reports;
}
