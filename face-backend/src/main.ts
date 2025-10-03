import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";
import { json, urlencoded } from "express";
import { PRIVATE_UPLOADS } from "./multer.config";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>("CORS_ORIGIN"),
    credentials: true,
  });

  app.use(json({limit: "50mb"}));
  app.use(urlencoded({limit: "50mb", extended: true}));

  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get<number>("PORT")
  await app.listen(<any>port);
  console.log("Backend is running");
}
bootstrap(); 