import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./users/users.schema";
import { UserService } from "./users/users.service";
import { UserController } from "./users/users.controller";
import { Face, FaceSchema } from "./faces/face.schema";
import { FaceService } from "./faces/face.service";
import { FaceController } from "./faces/face.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { FilesController } from "./files/files-uploads.controller";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>("MONGO_URI"),
            }),
        }),
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
        MongooseModule.forFeature([{name: Face.name, schema: FaceSchema}]),
        AuthModule,
    ],
    controllers: [UserController, FaceController, FilesController],
    providers: [UserService, FaceService],
})
export class AppModule {} 