import { BadRequestException, Injectable } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from "./users.schema";
import { AuthService } from "src/auth/auth.service";
import { Face, FaceDocument } from "src/faces/face.schema";
import { Types } from "mongoose";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private authService: AuthService, @InjectModel(Face.name) private faceModel: Model<FaceDocument>) {}
    async register(email: string, password: string, fullName: string): Promise<UserDocument> {
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new this.userModel({email, passwordHash, fullName});

        try {
            return await user.save();

        } catch (e: any) {
            if (e.code === 11000) {
                throw new BadRequestException("Email đã được đăng ký trước đó");
            }
            throw e;
        }
    }

    async login(email: string, password: string) {
        const user = await this.userModel.findOne({email}).exec();

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }
        const token = this.authService.generateToken({id: user._id.toString(), email: user.email});
        const hasFace = await this.faceModel.findOne({ userId: new Types.ObjectId(user._id) }).exec();

        return {id: user._id.toString(), email: user.email, fullName: user.fullName, accessToken: token, step: hasFace ? "face_verify_required" : "face_register_required" };
    }
}