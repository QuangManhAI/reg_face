import { Body, Controller, Post, BadRequestException, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { FaceService } from "./face.service";
import { multerConfig } from "src/multer.config";
import { FilesInterceptor } from "@nestjs/platform-express";
import axios from "axios";
import FormData = require("form-data");
import * as fs from "fs";


interface BestFrameRespone {
    status: string;
    index: number;
    confidence?: number;
    msg?: string;
}


@Controller('faces')
export class FaceController {
    constructor(private readonly faceService: FaceService) {}

    @Post('register')
    @UseInterceptors(FilesInterceptor("files", 10, multerConfig))
    async register(@Body("userId") userId: string,
    @UploadedFiles() files: Express.Multer.File[]) {

        if(!files || files.length === 0) {
            throw new BadRequestException("No files uploaded")
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", fs.createReadStream(file.path), file.originalname);
        });

        const res = await axios.post<BestFrameRespone>("http://localhost:9100/select_best_frame", formData, {
            headers: formData.getHeaders(),
        });

          if (res.data.status === "error") {
            throw new BadRequestException(res.data.msg || "No valid face detected");
        }

        const bestIdx = res.data.index;
        const bestFile = files[bestIdx];
        const refFile = `uploads/${bestFile.filename}`;

        files.forEach((file, idx) => {
            if (idx !== bestIdx) {
                fs.unlinkSync(file.path);
            }
            });

        const face = await this.faceService.register(userId, refFile);

        return {
            id: face._id,
            userId: face.userId,
            refFile: face.refFile,
            confidence: res.data.confidence, // log confidence của best frame
        };
    }

    @Post('verify-login')
    async verifyLogin(@Body() body: {userId: string; frames: string[]}) {
        if (!body.frames || body.frames.length === 0) {
            throw new BadRequestException("No frames");
        }
        console.log("/faces/verify-login called with userId:", body.userId, "frames:", body.frames?.length);
        const result = await this.faceService.verify(body.userId, body.frames);

        if (result.success) {
            return {success: true, userId: body.userId, similarity: result.similarity, confidence: result.confidence};
        } else {
            return { success: false, msg: "Face not match", similarity: result.similarity, confidence: result.confidence};
        }
    }
}