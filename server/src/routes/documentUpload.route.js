import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  uploadDocument,
  getAllDocument,
} from "../controllers/documentUpload.controller.js";

const documentRoutes = Router();

documentRoutes.route("/upload").post(upload.single("file"), uploadDocument);
documentRoutes.route("/extract").get(getAllDocument);

export { documentRoutes };

// // later I will do this
// upload.fields([
//     {
//       name: "f",
//       maxCount: 1,
//     },
//   ]),
