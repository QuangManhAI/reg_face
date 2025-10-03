import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import type { Response } from "express";
import * as path from "path";
import * as fs from "fs";
import { PRIVATE_UPLOADS } from "src/multer.config";

@Controller("files")
export class FilesController {
    @UseGuards(JwtAuthGuard)
    @Get(":filename")
    async getFile(@Param("filename") filename: string, @Res() res: Response) {
        const filePath = path.join(PRIVATE_UPLOADS, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).send("File not found");
        }

        return res.sendFile(filePath);
    }
}