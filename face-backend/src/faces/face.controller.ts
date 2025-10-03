import { Body, Controller, Post, BadRequestException, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { FaceService } from "./face.service";
import { multerConfig } from "src/multer.config";
import { FilesInterceptor } from "@nestjs/platform-express";
import axios from "axios";
import FormData = require("form-data");
import * as fs from "fs";
import * as path from "path";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Request } from "@nestjs/common";


interface BestFrameRespone {
    status: string;
    index: number;
    confidence?: number;
    msg?: string;
}


@Controller('faces')
export class FaceController {
    constructor(private readonly faceService: FaceService) {}

    @UseGuards(JwtAuthGuard)
    @Post('register')
    @UseInterceptors(FilesInterceptor("files", 10, multerConfig))
    async register(@Request() req,
    @UploadedFiles() files: Express.Multer.File[]){
        
        const userId = req.user.userId;
        if (!files || files.length == 0) {
            throw new BadRequestException("No files uploaded");
        }

        const formData = new FormData();
        files.forEach((file) => {
            const fullPath = path.join(file.destination, file.filename);
            formData.append("files", fs.createReadStream(fullPath), file.originalname);
        });

        let bestIdx = -1;
        let confidence: number | undefined;

        try {
            const res =  await axios.post<BestFrameRespone>(
                "http://localhost:9100/select_best_frame",
                formData, 
                {headers: formData.getHeaders()}
            );

            if (res.data.status === "ok") {
                bestIdx = res.data.index;
                confidence =  res.data.confidence;
            }
        } catch (e) {
            console.error("AI Service failed", e.message);
        }

        if (bestIdx < 0) {
            bestIdx = 0;
        }

        const bestFile = files[bestIdx];
        if (!bestFile) {
            throw new BadRequestException("No valid file found");
        }

        const filePath = path.join(bestFile.destination, bestFile.filename);
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
        throw new BadRequestException("Ảnh bị rỗng, vui lòng thử lại!");
        }
        if (await this.faceService.isBlackImage(filePath)) {
        throw new BadRequestException("Ảnh quá tối/đen, vui lòng chụp lại nơi có ánh sáng!");
        }

        const refFile = bestFile.filename;

        files.forEach((file, idx) => {
            if (idx !== bestIdx && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

        const face = await this.faceService.register(userId, refFile);
        console.log("Decoded user from token:", req.user);
        return {
            id: face._id,
            userId: face.userId,
            refFile: face.refFile,
            confidence,
        }
    }
    @UseGuards(JwtAuthGuard)
    @Post('verify-login')
    async verifyLogin(@Request() req, @Body() body: {frames: string[]}) {
        const userId = req.user.userId;
        if (!body.frames || body.frames.length === 0) {
            throw new BadRequestException("No frames");
        }
        console.log("/faces/verify-login called with userId:", userId, "frames:", body.frames?.length);
        const result = await this.faceService.verify(userId, body.frames);


        const SIM_THRESHOLD = 0.7;
        const CONF_THRESHOLD = 0.7;

        if (result.similarity < SIM_THRESHOLD) {
        return {
            success: false,
            msg: "Khuôn mặt không khớp với dữ liệu đã đăng ký",
            similarity: result.similarity,
            confidence: result.confidence
        };
        }

        if (result.confidence < CONF_THRESHOLD) {
        return {
            success: false,
            msg: "Độ tin cậy nhận diện thấp, vui lòng thử lại",
            similarity: result.similarity,
            confidence: result.confidence
        };
        }

        return {
        success: true,
        userId,
        msg: "Xác thực thành công",
        similarity: result.similarity,
        confidence: result.confidence
        };

    }
}