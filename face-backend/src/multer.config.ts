import { diskStorage } from "multer";
import { v4 as uuid } from "uuid";
import * as path from "path";
import { extname } from "path";

export const PRIVATE_UPLOADS = path.join(process.cwd(), "uploads");

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