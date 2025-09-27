import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type FaceDocument = Face & Document & {_id: string};
@Schema({timestamps: true})
export class Face {
    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    userId: Types.ObjectId;

    @Prop({required: true, type: String})
    refFile: string;

    @Prop({type: Number, default: null})
    similarity: number;

    @Prop({type: Number, default: null})
    confidence: number;
}


export const FaceSchema = SchemaFactory.createForClass(Face);