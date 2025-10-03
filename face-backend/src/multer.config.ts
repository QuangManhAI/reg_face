import { diskStorage } from "multer";
import { v4 as uuid } from "uuid";
import * as path from "path";
import { extname } from "path";

const UPLOADS_DIR = <any>process.env.UPLOADS_DIR || "uploads";
export const PRIVATE_UPLOADS = path.join(process.cwd(), UPLOADS_DIR);

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, PRIVATE_UPLOADS);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuid()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
};