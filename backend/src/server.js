
import express from "express";
import cors from "cors";
import multer from "multer";
import { PDFParse } from "pdf-parse";

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

import { analyzeLayout } from "./layoutAnalyzer.js";
import { analyzeResume } from "./resumeAnalyzer.js";

const app = express();

app.use(cors());
app.use(express.json());


const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});


app.get("/", (req, res) => {
  res.send("AI Resume Analyzer is running");
});


app.post(
  "/api/resume/analyze",
  upload.single("resume"),
  async (req, res) => {
    let parser;
    let pdf;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a PDF resume"
        });
      }

      console.log("Resume received:", req.file.originalname);

      parser = new PDFParse({
        data: req.file.buffer
      });

      const textResult = await parser.getText();

      const resumeText = textResult.text;

      if (!resumeText || !resumeText.trim()) {
        return res.status(400).json({
          success: false,
          message: "No readable text found in PDF. Scanned PDFs are not supported yet."
        });
      }


      const loadingTask = getDocument({
        data: new Uint8Array(req.file.buffer)
      });

      pdf = await loadingTask.promise;

      const pages = [];

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: 1
        });

        const content = await page.getTextContent();

        const items = content.items
          .filter((item) => item.str?.trim())
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


      const layoutReport = analyzeLayout(pages);

     
      const aiAnalysis = await analyzeResume(
        resumeText,
        layoutReport
      );

      console.log("Resume analysis completed");

      return res.status(200).json({
        success: true,
        fileName: req.file.originalname,
        totalPages: pdf.numPages,
        analysis: aiAnalysis,
        layout: layoutReport
      });

    } catch (error) {
      console.error("Resume analysis error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Resume analysis failed"
      });

    } finally {
      if (parser) {
        await parser.destroy();
      }

      if (pdf) {
        await pdf.destroy();
      }
    }
  }
);


app.use((err, req, res, next) => {
  console.error("Upload error:", err.message);

  return res.status(400).json({
    success: false,
    message: err.message
  });
});

// Start server
app.listen(5000, () => {
  console.log("AI Resume Analyzer running on port 5000");
});
