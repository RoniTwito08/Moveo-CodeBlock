import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICodeBlock extends Document {
  _id: Types.ObjectId;
  title: string;
  initialCode: string;
  solution: string;
  difficulty:number;
  explanation: string;
  createdAt?: Date;
}

const codeBlockSchema = new Schema<ICodeBlock>(
  {
    title:
        {
         type: String, 
         required: true 
        },
    initialCode:
       { 
        type: String, 
        required: true 
       },
    solution:
       {  type: String, 
        required: true
       },
       difficulty:
        { 
          type: Number, 
          required: true, 
          min: 1, 
          max: 5 
        },
        explanation: {
          type: String,
          required: true
        }
  },
  {
    timestamps: 
       { createdAt: true,
         updatedAt: false 
       },
  }
);

export default mongoose.model<ICodeBlock>("CodeBlock", codeBlockSchema);
