import fs from "fs";
import textract from "textract";
import Tesseract from "tesseract.js";

/**
 * Hybrid text extractor: uses textract for text-based files,
 * and Tesseract.js (OCR) for scanned or image-based files.
 */
const extractTextFromFile = async (filePath, mimeType) => {
  try {
    // 1. Try text-based extraction first
    if (
      mimeType.startsWith("text/") ||
      mimeType.includes("word") ||
      mimeType.includes("csv") ||
      mimeType.includes("pdf")
    ) {
      try {
        const text = await new Promise((resolve, reject) => {
          textract.fromFileWithPath(filePath, (error, text) => {
            if (error) reject(error);
            else resolve(text);
          });
        });

        if (text && text.trim().length > 50) {
          console.log("Text extracted successfully using Textract");
          return text.trim();
        } else {
          console.log("Textract returned empty — falling back to OCR");
        }
      } catch (err) {
        console.warn("Textract failed, falling back to OCR:", err.message);
      }
    }

    // 2. Fallback to OCR for images or scanned PDFs
    console.log("Running OCR with Tesseract...");
    const { data } = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          process.stdout.write(
            `\r OCR progress: ${(m.progress * 100).toFixed(0)}%`
          );
        }
      },
    });

    console.log("\n OCR extraction complete!");
    return data.text.trim();
  } catch (error) {
    console.error("Error extracting text:", error);
    return "";
  }
};

export { extractTextFromFile };
