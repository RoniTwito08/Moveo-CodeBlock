import mongoose, { Schema, Document } from "mongoose";

export interface ICodeBlock extends Document {
  title: string;
  initialCode: string;
  solution: string;
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
  },
  {
    timestamps: 
       { createdAt: true,
         updatedAt: false 
       },
  }
);

export default mongoose.model<ICodeBlock>("CodeBlock", codeBlockSchema);
