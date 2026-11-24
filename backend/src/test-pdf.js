
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs";
import { analyzeLayout } from "./layoutAnalyzer.js";

async function runAnalysis() {
  try {
    const pdfBuffer = fs.readFileSync("./main_tex.pdf");

    const loadingTask = getDocument({
      data: new Uint8Array(pdfBuffer)
    });

    const pdf = await loadingTask.promise;

    const pages = [];

    console.log("Total pages:", pdf.numPages);

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      const page = await pdf.getPage(pageNumber);

      const viewport = page.getViewport({ scale: 1 });

      const textContent = await page.getTextContent();

      const items = textContent.items
        .filter((item) => item.str.trim() !== "")
        .map((item) => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height
        }));

      pages.push({
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        items
      });
    }

    const report = analyzeLayout(pages);

    console.log("\nResume Layout Report:");
    console.log(JSON.stringify(report, null, 2));

    await pdf.destroy();

  } catch (error) {
    console.error("Analysis failed:", error);
  }
}

runAnalysis();
