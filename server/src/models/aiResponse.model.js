import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AiResponsesSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    reply: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "analysis_response",
    },
  },
  { timestamps: true }
);

export const AiResponse = model("AiResponse", AiResponsesSchema);
