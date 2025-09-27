import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document & {_id: string};

@Schema({timestamps: true})
export class User {
    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: true})
    passwordHash: string;

    @Prop({required: true})
    fullName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);