// import fs from "fs";
import { Document } from "../models/documentUpload.model.js";
import { extractTextFromFile } from "../utils/extractText.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const { path, filename, originalname, mimetype, size } = req.file;

  //  extract text
  const extractedText = await extractTextFromFile(path, mimetype);

  // save to DB
  const doc = await Document.create({
    filename,
    originalName: originalname,
    fileType: mimetype,
    fileSize: size,
    extractedText,
    uploadedBy: req.user?._id || null,
  });

  // // Delete uploaded file from local storage after saving (optional cleanup) => (we will do this in future not now)
  //   try {
  //     fs.unlinkSync(path);
  //     console.log(` Deleted local file after processing: ${filename}`);
  //   } catch (err) {
  //     console.warn(` Could not delete file: ${filename} — ${err.message}`);
  //   }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        doc,
        "Document uploaded & text extracted successfully"
      )
    );
});

const getAllDocument = asyncHandler(async (req, res) => {
  const docs = await Document.find().sort({ createdAt: -1 });
  return res.status(201).json(new ApiResponse(200, docs, "Fetched documents"));
});

export { uploadDocument, getAllDocument };
