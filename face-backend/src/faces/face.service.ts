import { Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Face, FaceDocument } from "./face.schema";
import { Types } from "mongoose";
import { PRIVATE_UPLOADS } from "src/multer.config";
import axios, { create } from "axios";
import { Jimp } from "jimp";
import FormData = require("form-data");
import { ConfigService } from "@nestjs/config";
import * as path from "path";

@Injectable()
export class FaceService {
  constructor(@InjectModel(Face.name) private faceModel: Model<FaceDocument>, private configService: ConfigService) {}

  async  isBlackImage(filePath:string): Promise<boolean> {
    const image = await Jimp.read(filePath);
    let total = 0;
    let count = 0;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx){
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      total += red + green + blue;
      count++;
    });

    const avg = total / (count*3);
    return avg < 5;
  }

  async register(userId: string, refFile: string): Promise<FaceDocument> {
    const face = new this.faceModel({ userId: new Types.ObjectId(userId), refFile});
    console.log("Registering face for userId:", userId);
    return face.save();
  }

  async verify(userId: string, frames: string[]) {
    try {

      const latestFace = await this.faceModel.findOne({userId: new Types.ObjectId(userId)}).exec();
      if (!latestFace || !latestFace.refFile) {
        throw new HttpException("No reference face found", 404);
      }
      const refPath = path.join(PRIVATE_UPLOADS, latestFace.refFile);
      const formData = new FormData();
      formData.append("ref_path", path.join("uploads", latestFace.refFile));
      frames.forEach((frame, i) => {
        const base64Data = frame.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(base64Data, "base64");
        formData.append("files", buf, { filename: `frame_${i}.jpg` });
      });

      const aiUrl = this.configService.get<string>("AI_SERVICE_URL");
      const res = await axios.post<any>(
        `${aiUrl}/extract_batch`,
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
