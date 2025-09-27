import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from "./users.schema";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
    async register(email: string, password: string, fullName: string): Promise<UserDocument> {
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new this.userModel({email, passwordHash, fullName});
        return user.save();
    }

    async login(email: string, password: string) {
        const user = await this.userModel.findOne({email}).exec();
        if (!user) {
            throw new Error("user not found");
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error("Invalid credientials");
        }

        return {id: user._id.toString(), email: user.email, fullName: user.fullName};
    }

}