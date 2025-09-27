import {diskStorage} from "multer";
import {v4 as uuid} from "uuid";
import { extname } from "path";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const multerConfig: MulterOptions = {
    storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
            const uniqueName = `${uuid()}${extname(file.originalname)}`;
            cb(null, uniqueName);
        },
    }),
};