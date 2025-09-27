import { Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Face, FaceDocument } from "./face.schema";
import axios, { create } from "axios";
import FormData = require("form-data");

@Injectable()
export class FaceService {
  constructor(@InjectModel(Face.name) private faceModel: Model<FaceDocument>) {}

  async register(userId: string, refFile: string): Promise<FaceDocument> {
    const face = new this.faceModel({ userId, refFile});
    return face.save();
  }

  async verify(userId: string, frames: string[]) {
    try {

      const latestFace = await this.faceModel.findOne({userId}).exec();
      if (!latestFace || !latestFace.refFile) {
        throw new HttpException("No reference face found", 404);
      }

      const formData = new FormData();
      formData.append("ref_path", latestFace.refFile.startsWith("./") ? latestFace.refFile : `./${latestFace.refFile}`);
      frames.forEach((frame, i) => {
        const base64Data = frame.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(base64Data, "base64");
        formData.append("files", buf, { filename: `frame_${i}.jpg` });
      });

      const res = await axios.post<any>(
        "http://localhost:9100/extract_batch",
        formData,
        { headers: formData.getHeaders() }
      );

      if (res.data.status === "error") {
        console.log("Model returned error:", res.data.msg);
        return { success: false, similarity: 0, confidence: 0, msg: res.data.msg };
      }

      const sim: number = res.data.similarity;
      const conf: number = res.data.confidence;
      console.log("Model similarity:", sim, "confidence: ", conf);

      latestFace.similarity = sim;
      latestFace.confidence = conf;
      await latestFace.save();

      return { success: sim > 0.7, similarity: sim, confidence: conf, framesUsed: res.data.frames_used };

    } catch (err) {
      console.error("Verify failed:", err.message);
      console.error(err);
      throw new HttpException("Face verification failed", 500);
    }

  }
}
